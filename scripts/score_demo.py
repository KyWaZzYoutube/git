#!/usr/bin/env python3
"""
Bande-son 100 % synthétisée (aucun échantillon externe → aucun souci de droits).

  python3 scripts/score_demo.py       → build/demo/audio.wav (48 kHz, stéréo)

Musique : 120 BPM, la mineur → do majeur (Am9 · Fmaj7 · Cadd9 · G, cadence finale sur C).
  0–4 s   intro tendue (sonnerie, tic-tac, montée)      4 s  DROP
  4–18 s  groove (kick, clap, charleston, basse, pad, arpèges)
  18–20 s break + roulement      20 s  impact final, accord de do qui résonne sous la signature.
Design sonore : chaque repère de build/cues.json (exporté par la timeline) déclenche un effet.
"""
import json, os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build', 'demo')
cfg = json.load(open(os.path.join(BUILD, 'cues.json')))
DUR = float(cfg['duration'])
N = int(round(SR * DUR))
rng = np.random.default_rng(7)

BEAT = 0.5
DROP, BREAK, FINAL = 4.0, 18.0, 20.0


# ----------------------------------------------------------------------------- outils
def mtof(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def tt(n):
    return np.arange(n) / SR


def ns(sec):
    return max(1, int(round(sec * SR)))


def butter(kind, fc, order=2):
    return signal.butter(order, fc, kind, fs=SR, output='sos')


def lp(x, fc, order=2):
    return signal.sosfilt(butter('low', min(fc, SR * 0.45), order), x, axis=0)


def hp(x, fc, order=2):
    return signal.sosfilt(butter('high', fc, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(butter('band', [lo, min(hi, SR * 0.45)], order), x, axis=0)


def sweep(x, fc_fn, kind='low', order=2, block=256):
    """Filtre variable dans le temps (mono) : coefficients recalculés par bloc, état conservé."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        fc = fc_fn(i / SR)
        if kind == 'band':
            lo, hi = fc
            fc = [max(20.0, lo), min(SR * 0.45, max(hi, lo * 1.05))]
        else:
            fc = min(max(20.0, fc), SR * 0.45)
        sos = butter(kind, fc, order)
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return y


def saw(freq, n, phase0=None):
    """Dent de scie anti-repliement (PolyBLEP), fréquence fixe ou variable."""
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    dt = f / SR
    ph = ((rng.random() if phase0 is None else phase0) + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt[m]
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt[m]
    y[m] -= x * x + x + x + 1
    return y


def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR + phase0)


def supersaw(midi, n, voices=5, detune=0.14):
    out = np.zeros(n)
    for k in range(voices):
        d = (k - (voices - 1) / 2) / ((voices - 1) / 2) * detune
        out += saw(mtof(midi + d), n)
    return out / voices


def stereo(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1) * np.sqrt(2)


def fades(x, fi=0.003, fo=0.01):
    n = len(x)
    e = np.ones(n)
    a, b = min(n, ns(fi)), min(n, ns(fo))
    e[:a] = np.linspace(0, 1, a)
    e[n - b:] *= np.linspace(1, 0, b)
    return x * (e if x.ndim == 1 else e[:, None])


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        if sig.ndim == 1:
            sig = stereo(sig, pan)
        i0 = int(round(t0 * SR))
        if i0 < 0:
            sig, i0 = sig[-i0:], 0
        n = min(len(sig), N - i0)
        if n > 0:
            self.x[i0:i0 + n] += sig[:n] * gain


def make_ir(dur=2.6, predelay=0.014, damp=5200):
    n = ns(dur)
    t = tt(n)
    chans = []
    for _ in range(2):
        x = rng.standard_normal(n) * np.exp(-t / (dur / 6.9))
        x = lp(x, damp, 1)
        x[:ns(predelay)] = 0
        chans.append(x)
    ir = np.stack(chans, 1)
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def reverb(bus, ir):
    mono = bus.x.mean(axis=1)
    return np.stack([signal.fftconvolve(mono, ir[:, c])[:N] for c in range(2)], 1)


def pingpong(x_mono, delay=0.375, fb=0.38, taps=5):
    """Écho ping-pong (croche pointée à 120 BPM)."""
    out = np.zeros((len(x_mono), 2))
    d = ns(delay)
    for k in range(1, taps + 1):
        g = fb ** k
        sh = np.zeros(len(x_mono))
        if k * d < len(x_mono):
            sh[k * d:] = x_mono[:-k * d]
        out[:, k % 2] += sh * g
    return out


# ----------------------------------------------------------------------------- harmonie
#            début  fin    basse  voicing du pad
CHORDS = [(0.0, 4.0, 45, [52, 57, 60, 64, 67]),      # Am7 (intro)
          (4.0, 6.0, 45, [52, 57, 60, 64, 71]),      # Am9
          (6.0, 8.0, 41, [53, 57, 60, 64, 67]),      # Fmaj9
          (8.0, 10.0, 48, [52, 55, 60, 62, 67]),     # Cadd9
          (10.0, 12.0, 43, [50, 55, 59, 62, 67]),    # G
          (12.0, 14.0, 45, [52, 57, 60, 64, 71]),    # Am9
          (14.0, 16.0, 41, [53, 57, 60, 64, 67]),    # Fmaj9
          (16.0, 18.0, 48, [52, 55, 60, 62, 67]),    # Cadd9
          (18.0, 20.0, 43, [50, 55, 60, 62, 67]),    # Gsus4 (break)
          (20.0, DUR, 36, [55, 60, 64, 67, 74])]     # Cadd9 final
ARP = {45: [69, 72, 76, 81, 76, 72, 71, 72], 41: [69, 72, 77, 81, 77, 72, 76, 72],
       48: [67, 72, 74, 79, 76, 74, 72, 74], 43: [67, 71, 74, 79, 74, 71, 69, 71]}


def chord_at(t):
    for c in CHORDS:
        if c[0] <= t < c[1]:
            return c
    return CHORDS[-1]


# ----------------------------------------------------------------------------- instruments
def kick(n=None):
    n = n or ns(0.5)
    t = tt(n)
    f = 50 + 130 * np.exp(-t / 0.03)
    body = sine(f, n) * np.exp(-t / 0.17)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.55
    return np.tanh((body + click) * 1.8) / np.tanh(1.8)


def clap():
    n = ns(0.4)
    t = tt(n)
    e = np.zeros(n)
    for d, tau in ((0, 0.01), (0.011, 0.01), (0.023, 0.012), (0.035, 0.1)):
        m = t >= d
        e[m] += np.exp(-(t[m] - d) / tau)
    return bp(rng.standard_normal(n) * e, 900, 4200) * 0.9


def hat(open_=False):
    n = ns(0.3 if open_ else 0.07)
    t = tt(n)
    x = sum(np.sign(np.sin(2 * np.pi * f * t + rng.random() * 6)) for f in (205.3, 304.4, 369.6, 522.7, 540.0, 800.0)) / 6
    x = 0.55 * x + 0.45 * rng.standard_normal(n)
    return hp(x, 7200, 4) * np.exp(-t / (0.1 if open_ else 0.016))


def snare(vel=1.0):
    n = ns(0.25)
    t = tt(n)
    tone = sine(190 * (1 + 0.3 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.045) * 0.45
    noise = bp(rng.standard_normal(n), 1400, 8000) * np.exp(-t / 0.075)
    return (tone + noise) * vel


def crash(dur=2.6):
    n = ns(dur)
    t = tt(n)
    e = np.exp(-t / (dur / 4.5)) * np.minimum(1, t / 0.002)
    return np.stack([hp(rng.standard_normal(n), 4800, 2) * e, hp(rng.standard_normal(n), 4800, 2) * e], 1) * 0.55


def pluck(midi, dur=0.22):
    n = ns(dur)
    t = tt(n)
    f = mtof(midi)
    x = 0.65 * saw(f, n) + 0.35 * np.sign(np.sin(2 * np.pi * f * t))
    x = sweep(x, lambda s: 700 + 5200 * np.exp(-s / 0.045), 'low')
    return fades(x * np.exp(-t / 0.085), 0.002, 0.02)


def bell(freqs, n, tau=0.5, partials=((1, 1), (2.76, 0.28), (5.4, 0.12))):
    t = tt(n)
    x = np.zeros(n)
    for f in np.atleast_1d(freqs):
        for r, a in partials:
            x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (tau / r ** 0.5))
    return x * np.minimum(1, t / 0.002)


# ----------------------------------------------------------------------------- bus
drums, bass_b, pad_b, arp_b, fx, verb_send = Bus(), Bus(), Bus(), Bus(), Bus(), Bus()

# --- batterie
kick_times = [DROP + i * BEAT for i in range(int((BREAK - DROP) / BEAT) + 1)] + [FINAL]
for kt in kick_times:
    drums.add(kick(), kt, 0.95)
for i in range(int((BREAK - DROP) / 1.0)):
    tc = DROP + 0.5 + i
    drums.add(clap(), tc, 0.34, pan=0.05)
    verb_send.add(clap(), tc, 0.12)
t16 = np.arange(DROP, BREAK, 0.125)
for k, th in enumerate(t16):
    vel = (0.28, 0.12, 0.5, 0.14)[k % 4]
    drums.add(hat(), th, vel * 0.42, pan=0.25)
for th in np.arange(6.0 + 0.25, BREAK, 0.5):
    drums.add(hat(True), th, 0.16, pan=-0.2)
# tic-tac de l'intro (tension), puis roulement de la montée
for k, th in enumerate(np.arange(1.5, DROP, 0.125)):
    drums.add(hat(), th, (0.1 + 0.18 * (th - 1.5) / 2.5) * (1.3 if k % 4 == 0 else 0.8), pan=0.3)


def roll(t0, t1, v0, v1, gain):
    t, k = t0, 0
    while t < t1 - 1e-6:
        p = (t - t0) / (t1 - t0)
        step = 0.125 if p < 0.45 else (0.0625 if p < 0.8 else 0.03125)
        drums.add(snare(v0 + (v1 - v0) * p ** 1.5), t, gain, pan=0.0)
        t += step
        k += 1


roll(3.0, 3.97, 0.15, 0.8, 0.38)
roll(18.5, 19.86, 0.1, 1.0, 0.42)
drums.add(crash(), DROP, 0.5)
drums.add(crash(), 12.0, 0.22)
drums.add(crash(3.8), FINAL, 0.7)

# --- side-chain (le pad et la basse « respirent » avec le kick)
sc = np.ones(N)
for kt in kick_times:
    i0, n = ns(kt), ns(0.4)
    g = 1 - 0.7 * np.exp(-tt(n) / 0.085)
    n = min(n, N - i0)
    sc[i0:i0 + n] = np.minimum(sc[i0:i0 + n], g[:n])

# --- basse : croches, fondamentale
for tb in np.arange(DROP, BREAK, 0.25):
    root = chord_at(tb + 1e-3)[2]
    n = ns(0.24)
    t = tt(n)
    f = mtof(root)
    x = lp(saw(f, n), 900) * 0.85 + sine(f / 2, n) * 0.35
    env = np.exp(-t / 0.2) * np.minimum(1, t / 0.004)
    bass_b.add(fades(x * env, 0.002, 0.02), tb, 0.5)
# basse tenue dans le break
for c in CHORDS:
    if c[0] == BREAK:
        n = ns(c[1] - c[0])
        t = tt(n)
        x = sine(mtof(c[2]) / 2, n) * 0.6 * np.minimum(1, t / 0.3)
        bass_b.add(fades(x, 0.01, 0.2), c[0], 0.35)

# --- pad (supersaw stéréo, filtre qui s'ouvre selon la section)
for (a, b, root, notes) in CHORDS:
    n = ns(b - a + 0.35)
    t = tt(n)
    L = sum(supersaw(m, n) for m in notes) / len(notes)
    R = sum(supersaw(m, n) for m in notes) / len(notes)
    env = np.minimum(1, t / (0.35 if a == 0 else 0.04)) * np.clip((b - a + 0.35 - t) / 0.35, 0, 1)
    pad_b.add(np.stack([L * env, R * env], 1), a, 1.0)


def pad_cutoff(s):
    if s < 2.4:
        return 420 + 150 * s / 2.4
    if s < DROP:
        return 570 + 2400 * ((s - 2.4) / 1.6) ** 2
    if s < BREAK:
        return 2300
    if s < FINAL:
        return 700 + 5200 * ((s - BREAK) / 2) ** 2
    return 1300 + 4200 * np.exp(-(s - FINAL) / 1.2)


pad = np.stack([sweep(pad_b.x[:, c], pad_cutoff, 'low') for c in range(2)], 1)
pad_gain = np.interp(tt(N), [0, 0.4, 2.4, DROP, BREAK, FINAL - 0.01, FINAL, 23.5, DUR],
                     [0.0, 0.55, 0.6, 0.8, 0.8, 1.0, 1.25, 0.9, 0.0])
pad *= (pad_gain * np.where((tt(N) >= DROP) & (tt(N) < BREAK), sc, 1.0))[:, None] * 1.4

# --- arpèges (à partir de 8 s) + scintillement final
for k, ta in enumerate(np.arange(8.0, BREAK, 0.125)):
    root = chord_at(ta + 1e-3)[2]
    m = ARP[root][k % 8]
    arp_b.add(pluck(m), ta, 0.5 if k % 2 == 0 else 0.34, pan=(-0.35 if k % 2 else 0.35))
for k, ta in enumerate(np.arange(FINAL + 0.5, 24.0, 0.25)):
    m = [84, 86, 88, 91, 93, 91, 88, 86][k % 8]
    arp_b.add(pluck(m, 0.3), ta, 0.38 * (1 - (ta - FINAL) / 5), pan=(-0.5 if k % 2 else 0.5))
arp_mono = arp_b.x.mean(axis=1)
arp = arp_b.x + pingpong(arp_mono) * 0.55
arp *= np.where((tt(N) >= DROP) & (tt(N) < BREAK), 0.55 + 0.45 * sc, 1.0)[:, None] * 1.1
verb_send.x += arp * 0.35

# --- montées (bruit filtré + glissando)
def riser(t0, t1, gain, tone=(57, 81)):
    n = ns(t1 - t0)
    t = tt(n)
    p = t / (t1 - t0)
    x = sweep(rng.standard_normal(n), lambda s: (300 + 7500 * (s / (t1 - t0)) ** 2, 900 + 11000 * (s / (t1 - t0)) ** 2), 'band')
    x = x * p ** 2.2
    g = lp(saw(mtof(tone[0] + (tone[1] - tone[0]) * p ** 1.6), n), 2600) * p ** 3 * 0.35
    fx.add(fades(x + g, 0.05, 0.02), t0, gain)
    verb_send.add(fades(x, 0.05, 0.02), t0, gain * 0.4)


riser(2.4, 3.98, 0.32)
riser(BREAK, 19.86, 0.36, tone=(55, 79))

# --- effets sonores sur les repères de la timeline
def whoosh(dur=0.5, lo=300.0, hi=2600.0, rumble=0.0, rev=False, pan=(-0.6, 0.6)):
    n = ns(dur)
    t = tt(n)
    p = t / dur
    shape = p ** 3 if rev else np.sin(np.pi * p) ** 2
    fc = lambda s: lo + (hi - lo) * ((s / dur) ** 2 if rev else np.sin(np.pi * min(1.0, s / dur)) ** 1.5)
    x = sweep(rng.standard_normal(n), lambda s: (fc(s) * 0.55, fc(s) * 1.7), 'band') * shape
    if rumble:
        x += lp(rng.standard_normal(n), 180) * shape * rumble
    a = (np.linspace(pan[0], pan[1], n) + 1) * np.pi / 4
    return fades(np.stack([x * np.cos(a), x * np.sin(a)], 1) * np.sqrt(2), 0.005, 0.01)


def pop(f0=520.0, f1=1000.0, dur=0.1):
    n = ns(dur)
    t = tt(n)
    f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.018))
    return sine(f, n) * np.exp(-t / 0.03) * np.minimum(1, t / 0.0015)


def click(f=3800.0, tau=0.004):
    n = ns(0.04)
    t = tt(n)
    return bp(rng.standard_normal(n), 1800, 9000) * np.exp(-t / tau) * 0.8 + sine(f, n) * np.exp(-t / 0.005) * 0.25


def sfx_ring():
    n = ns(1.12)
    t = tt(n)
    x = np.zeros(n)
    for b0 in (0.0, 0.56):
        m = (t >= b0) & (t < b0 + 0.48)
        tb = t[m] - b0
        tone = np.sin(2 * np.pi * 1245 * tb) + 0.75 * np.sin(2 * np.pi * 1575 * tb) + 0.25 * np.sin(2 * np.pi * 2510 * tb)
        ham = lp(0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 21 * tb)), 260)
        env = np.minimum(1, tb / 0.01) * np.clip((0.48 - tb) / 0.04, 0, 1)
        x[m] = tone * ham * env
    return bp(x, 600, 5200) * 0.5


def sfx_slash():
    n = ns(0.36)
    t = tt(n)
    x = sweep(rng.standard_normal(n), lambda s: (700 + 5200 * min(1, s / 0.24) ** 1.4, 1500 + 9000 * min(1, s / 0.24) ** 1.4), 'band')
    env = np.minimum(1, t / 0.16) ** 2 * np.exp(-np.maximum(0, t - 0.2) / 0.05)
    zing = sine(2400 + 3000 * np.minimum(1, t / 0.25), n) * env * 0.12
    return x * env + zing


def sfx_thud():
    n = ns(0.6)
    t = tt(n)
    return np.tanh(2 * sine(40 + 55 * np.exp(-t / 0.05), n) * np.exp(-t / 0.22)) + lp(rng.standard_normal(n), 900) * np.exp(-t / 0.02) * 0.5


def sfx_hit():
    n = ns(2.2)
    t = tt(n)
    low = (sine(55, n) * 0.7 + 0.6 * sine(110, n)) * np.exp(-t / 0.4) * np.minimum(1, t / 0.004)
    return low * 0.7 + bell([220.0, 261.63, 329.63], n, 1.0) * 0.18


def sfx_stretch():
    n = ns(0.42)
    t = tt(n)
    f = (170 + 420 * (1 - np.exp(-t / 0.12))) * (1 + 0.03 * np.sin(2 * np.pi * 17 * t))
    x = sine(f, n) + 0.3 * lp(saw(f * 2, n), 1800)
    return x * np.minimum(1, t / 0.02) * np.exp(-t / 0.16) * 0.7


def sfx_gold():
    n = ns(1.4)
    x = np.zeros(n)
    for k, f in enumerate((2093.0, 2637.0, 3136.0, 4186.0)):
        d = ns(0.035 * k)
        x[d:] += bell(f, n - d, 0.45) * (0.8 - 0.1 * k)
    return x * 0.5


def sfx_notif():
    n = ns(0.9)
    x = np.zeros(n)
    for k, f in enumerate((1174.66, 1567.98)):
        d = ns(0.085 * k)
        x[d:] += bell(f, n - d, 0.32, ((1, 1), (2, 0.25), (3, 0.08)))
    return x * 0.55


def sfx_boom():
    n = ns(1.2)
    t = tt(n)
    return sine(32 + 45 * np.exp(-t / 0.18), n) * np.exp(-t / 0.5) * np.minimum(1, t / 0.003) + lp(rng.standard_normal(n), 300) * np.exp(-t / 0.05) * 0.4


def sfx_zip():
    n = ns(0.22)
    t = tt(n)
    return sine(500 + 2600 * (t / 0.22) ** 1.5, n) * np.sin(np.pi * t / 0.22) ** 2 * 0.35 + hp(rng.standard_normal(n), 5000) * np.sin(np.pi * t / 0.22) ** 2 * 0.2


def sfx_ringback():
    n = ns(0.46)
    t = tt(n)
    x = np.tanh(2.2 * sine(440, n)) * np.minimum(1, t / 0.015) * np.clip((0.46 - t) / 0.03, 0, 1)
    return bp(x, 300, 3400) * 0.5


def sfx_impact():
    n = ns(0.9)
    t = tt(n)
    return np.tanh(2 * sine(45 + 80 * np.exp(-t / 0.04), n) * np.exp(-t / 0.3)) * 0.8 + lp(rng.standard_normal(n), 2500) * np.exp(-t / 0.03) * 0.5


def sfx_roll():
    n = ns(0.4)
    x = np.zeros(n)
    for k in range(11):
        d = ns(0.34 * (k / 11) ** 0.85)
        c = click(1800 + 160 * k, 0.003)
        x[d:d + len(c)] += c[:max(0, n - d)] * (0.5 + 0.05 * k)
    return x * 0.6


def sfx_hit_big():
    n = ns(1.6)
    t = tt(n)
    stab = sum(supersaw(m, n, 5, 0.18) for m in (53, 57, 60, 65, 69)) / 5
    stab = sweep(stab, lambda s: 900 + 6000 * np.exp(-s / 0.18), 'low') * np.exp(-t / 0.4) * np.minimum(1, t / 0.003)
    imp = np.zeros(n)
    i = sfx_impact()
    imp[:len(i)] = i
    return stab * 0.9 + imp * 0.6


def sfx_counter():
    n = ns(0.95)
    x = np.zeros(n)
    for k in range(16):
        d = ns(0.85 * (1 - (1 - k / 16) ** 2))
        c = click(2200 + 40 * k, 0.0025)
        x[d:d + len(c)] += c[:max(0, n - d)]
    return x * 0.35


def sfx_stamp():
    n = ns(0.7)
    t = tt(n)
    body = np.tanh(2.5 * sine(42 + 90 * np.exp(-t / 0.03), n) * np.exp(-t / 0.16))
    slap = bp(rng.standard_normal(n), 300, 2600) * np.exp(-t / 0.025)
    return body * 0.8 + slap * 0.6


def sfx_tick():
    n = ns(0.08)
    t = tt(n)
    return sine(1650, n) * np.exp(-t / 0.012) * 0.6 + bp(rng.standard_normal(n), 1500, 5000) * np.exp(-t / 0.003) * 0.4


def sfx_scramble():
    n = ns(0.66)
    x = np.zeros((n, 2))
    for _ in range(28):
        d = ns(rng.random() * 0.6)
        m = ns(0.01 + rng.random() * 0.012)
        f = 700 + rng.random() * 3000
        b = np.sign(np.sin(2 * np.pi * f * tt(m))) * np.hanning(m) * 0.25
        x[d:d + m] += stereo(b, rng.uniform(-0.7, 0.7))[:max(0, n - d)]
    return x


def sfx_final():
    n = ns(3.0)
    t = tt(n)
    sub = sine(28 + 42 * np.exp(-t / 0.35), n) * np.exp(-t / 1.1) * np.minimum(1, t / 0.004)
    return sub * 0.9


SFX = {
    'ring': (sfx_ring, 0.55, 0.15), 'slash': (sfx_slash, 0.5, 0.2), 'thud': (sfx_thud, 0.75, 0.1),
    'hit': (sfx_hit, 0.6, 0.45), 'pop': (lambda: pop(), 0.35, 0.12),
    'whoosh': (lambda: whoosh(0.5), 0.3, 0.15), 'whoosh_big': (lambda: whoosh(0.72, 150, 2300, 0.6), 0.42, 0.18),
    'swoosh': (lambda: whoosh(0.38, 500, 3600), 0.25, 0.12), 'swish': (lambda: whoosh(0.3, 2500, 9000), 0.16, 0.1),
    'suck': (lambda: whoosh(0.34, 300, 6500, 0.3, rev=True), 0.4, 0.1),
    'tick': (sfx_tick, 0.3, 0.12), 'riser': (None, 0, 0), 'stretch': (sfx_stretch, 0.3, 0.12),
    'type': (lambda: click(3000 + rng.random() * 1500), 0.14, 0.03), 'click': (lambda: click(2400, 0.006), 0.35, 0.08),
    'gold': (sfx_gold, 0.4, 0.45), 'boom': (sfx_boom, 0.6, 0.12), 'zip': (sfx_zip, 0.25, 0.1),
    'notif': (sfx_notif, 0.45, 0.35), 'tap': (lambda: click(900, 0.01) * 0.8 + pop(200, 150, 0.04)[:ns(0.04)], 0.4, 0.05),
    'ringback': (sfx_ringback, 0.35, 0.15), 'impact': (sfx_impact, 0.55, 0.2), 'roll': (sfx_roll, 0.5, 0.1),
    'hit_big': (sfx_hit_big, 0.6, 0.35), 'counter': (sfx_counter, 0.4, 0.05), 'stamp': (sfx_stamp, 0.7, 0.2),
    'scramble': (sfx_scramble, 0.5, 0.1), 'final': (sfx_final, 0.8, 0.1),
}
missing = set()
for c in cfg['cues']:
    spec = SFX.get(c['type'])
    if spec is None:
        missing.add(c['type'])
        continue
    fn, g, send = spec
    if fn is None:
        continue
    s = fades(fn(), 0.001, 0.03)
    gain = g * c.get('gain', 1.0)
    fx.add(s, c['t'], gain)
    if send:
        verb_send.add(s, c['t'], gain * send)
if missing:
    print('repères sans effet :', sorted(missing))

# --- réverbération
ir = make_ir()
verb_send.x += pad * 0.25
wet = reverb(verb_send, ir) * 0.5

# --- mixage
music = drums.x * 0.45 + bass_b.x * (sc[:, None] * 0.85 + 0.15) + pad + arp
tsec = tt(N)
# silence juste avant l'impact final + légère baisse pendant la tonalité d'appel
gate = np.ones(N)
gate[(tsec >= 19.875) & (tsec < FINAL)] = 0.0
gate = lp(gate, 60, 1)
duck = 1 - 0.35 * np.exp(-((tsec - 13.9) / 0.35) ** 2)
music *= (gate * duck)[:, None]

if os.environ.get('STEMS'):
    def db(x):
        return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    for name, x in (('batterie', drums.x * 0.45), ('basse', bass_b.x), ('pad', pad), ('arpèges', arp), ('effets', fx.x), ('réverb', wet)):
        print(f'{name:10s}', ' '.join(f'{db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 4), (4, 10), (10, 18), (18, 20), (20, 25))))
mix = music + fx.x * 1.4 + wet
mix = hp(mix, 28, 2)
# fin : on laisse résonner puis on s'éteint
fade = np.clip((DUR - tsec) / 0.9, 0, 1) ** 1.5
mix *= fade[:, None]
mix[: ns(0.004)] *= np.linspace(0, 1, ns(0.004))[:, None]

# --- master : saturation douce + normalisation crête -1 dBFS
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(1.35 * mix) / np.tanh(1.35)
mix *= 10 ** (-1.0 / 20) / (np.max(np.abs(mix)) + 1e-9)

out = os.path.join(BUILD, 'audio.wav')
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(out, f'{DUR:.2f} s')
