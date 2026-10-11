#!/usr/bin/env python3
"""
Bibliothèque de synthèse partagée par les partitions (scripts/score_*.py).

Tout est généré par calcul (aucun échantillon externe → aucun souci de droits) :
oscillateurs anti-repliement, filtres, instruments (kick, clap, charleston, piano
électrique FM, pad, pluck, basse…), effets d'interface et mastering.

Usage :
    import synth as S
    S.setup(duration=30, seed=7)
    bus = S.Bus()
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = 0
DUR = 0.0
rng = np.random.default_rng(7)


def setup(duration, seed=7):
    global N, DUR, rng
    DUR = float(duration)
    N = int(round(SR * DUR))
    rng = np.random.default_rng(seed)


def load_cues(comp):
    cfg = json.load(open(os.path.join(ROOT, 'build', comp, 'cues.json')))
    return float(cfg['duration']), cfg['cues']


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


def make_ir(dur=2.4, predelay=0.014, damp=5200):
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


def reverb(x_stereo, ir):
    mono = x_stereo.mean(axis=1)
    return np.stack([signal.fftconvolve(mono, ir[:, c])[:N] for c in range(2)], 1)


def pingpong(x_mono, delay=0.375, fb=0.38, taps=5):
    """Écho ping-pong (croche pointée à 120 BPM par défaut)."""
    out = np.zeros((len(x_mono), 2))
    d = ns(delay)
    for k in range(1, taps + 1):
        sh = np.zeros(len(x_mono))
        if k * d < len(x_mono):
            sh[k * d:] = x_mono[:-k * d]
        out[:, k % 2] += sh * fb ** k
    return out


def sidechain(times, depth=0.7, tau=0.085, length=0.4):
    sc = np.ones(N)
    for kt in times:
        i0, n = ns(kt), ns(length)
        if i0 >= N:
            continue
        g = 1 - depth * np.exp(-tt(n) / tau)
        n = min(n, N - i0)
        sc[i0:i0 + n] = np.minimum(sc[i0:i0 + n], g[:n])
    return sc


# ----------------------------------------------------------------------------- instruments
def kick(decay=0.17, punch=1.8):
    n = ns(0.5)
    t = tt(n)
    body = sine(50 + 130 * np.exp(-t / 0.03), n) * np.exp(-t / decay)
    click_ = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.55
    return np.tanh((body + click_) * punch) / np.tanh(punch)


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


def shaker():
    n = ns(0.09)
    t = tt(n)
    env = np.minimum(1, t / 0.012) * np.exp(-np.maximum(0, t - 0.012) / 0.025)
    return bp(rng.standard_normal(n), 5000, 14000) * env


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


def pluck(midi, dur=0.22, bright=5200):
    n = ns(dur)
    t = tt(n)
    f = mtof(midi)
    x = 0.65 * saw(f, n) + 0.35 * np.sign(np.sin(2 * np.pi * f * t))
    x = sweep(x, lambda s: 700 + bright * np.exp(-s / 0.045), 'low')
    return fades(x * np.exp(-t / 0.085), 0.002, 0.02)


def keys(notes, dur, vel=1.0, tone=2.0):
    """Piano électrique FM (type « Rhodes ») : porteuse + modulateur à index décroissant."""
    n = ns(dur + 0.6)
    t = tt(n)
    out = np.zeros(n)
    for m in np.atleast_1d(notes):
        f = float(mtof(m))
        idx = tone * np.exp(-t / 0.22) + 0.25
        x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
        x += 0.18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.15)
        out += x
    out /= max(1, len(np.atleast_1d(notes)))
    env = np.minimum(1, t / 0.003) * np.exp(-t / 1.2)
    rel = np.clip((dur + 0.6 - t) / 0.6, 0, 1) ** 2
    trem = 1 + 0.06 * np.sin(2 * np.pi * 5.2 * t)
    return out * env * rel * trem * vel


def bell(freqs, n, tau=0.5, partials=((1, 1), (2.76, 0.28), (5.4, 0.12))):
    t = tt(n)
    x = np.zeros(n)
    for f in np.atleast_1d(freqs):
        for r, a in partials:
            x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (tau / r ** 0.5))
    return x * np.minimum(1, t / 0.002)


def riser(dur, tone=(57, 81)):
    n = ns(dur)
    t = tt(n)
    p = t / dur
    x = sweep(rng.standard_normal(n), lambda s: (300 + 7500 * (s / dur) ** 2, 900 + 11000 * (s / dur) ** 2), 'band')
    x = x * p ** 2.2
    g = lp(saw(mtof(tone[0] + (tone[1] - tone[0]) * p ** 1.6), n), 2600) * p ** 3 * 0.35
    return fades(x + g, 0.05, 0.02)


# ----------------------------------------------------------------------------- effets d'interface
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


def tick():
    n = ns(0.08)
    t = tt(n)
    return sine(1650, n) * np.exp(-t / 0.012) * 0.6 + bp(rng.standard_normal(n), 1500, 5000) * np.exp(-t / 0.003) * 0.4


def sparkle(freqs=(2093.0, 2637.0, 3136.0, 4186.0), spread=0.035, tau=0.45):
    n = ns(1.4)
    x = np.zeros(n)
    for k, f in enumerate(freqs):
        d = ns(spread * k)
        x[d:] += bell(f, n - d, tau) * (0.8 - 0.1 * k)
    return x * 0.5


def chime(freqs=(1174.66, 1567.98), gap=0.085, tau=0.32):
    n = ns(0.9)
    x = np.zeros(n)
    for k, f in enumerate(freqs):
        d = ns(gap * k)
        x[d:] += bell(f, n - d, tau, ((1, 1), (2, 0.25), (3, 0.08)))
    return x * 0.55


def zip_():
    n = ns(0.22)
    t = tt(n)
    env = np.sin(np.pi * t / 0.22) ** 2
    return sine(500 + 2600 * (t / 0.22) ** 1.5, n) * env * 0.35 + hp(rng.standard_normal(n), 5000) * env * 0.2


def impact():
    n = ns(0.9)
    t = tt(n)
    return np.tanh(2 * sine(45 + 80 * np.exp(-t / 0.04), n) * np.exp(-t / 0.3)) * 0.8 + lp(rng.standard_normal(n), 2500) * np.exp(-t / 0.03) * 0.5


def stab(notes, dur=1.6, decay=0.4):
    n = ns(dur)
    t = tt(n)
    x = sum(supersaw(m, n, 5, 0.18) for m in notes) / len(notes)
    return sweep(x, lambda s: 900 + 6000 * np.exp(-s / 0.18), 'low') * np.exp(-t / decay) * np.minimum(1, t / 0.003)


def counter_ticks(count=16, dur=0.85):
    n = ns(dur + 0.1)
    x = np.zeros(n)
    for k in range(count):
        d = ns(dur * (1 - (1 - k / count) ** 2))
        c = click(2200 + 40 * k, 0.0025)
        x[d:d + len(c)] += c[:max(0, n - d)]
    return x * 0.35


def stamp():
    n = ns(0.7)
    t = tt(n)
    body = np.tanh(2.5 * sine(42 + 90 * np.exp(-t / 0.03), n) * np.exp(-t / 0.16))
    slap = bp(rng.standard_normal(n), 300, 2600) * np.exp(-t / 0.025)
    return body * 0.8 + slap * 0.6


def scribble(dur=0.95):
    """Stylo sur papier : bruit filtré modulé par des tracés irréguliers."""
    n = ns(dur)
    t = tt(n)
    strokes = np.zeros(n)
    pos = 0.0
    while pos < dur:
        L = 0.05 + rng.random() * 0.1
        m = (t >= pos) & (t < pos + L)
        strokes[m] = np.sin(np.pi * (t[m] - pos) / L) * (0.5 + 0.5 * rng.random())
        pos += L + rng.random() * 0.03
    x = sweep(rng.standard_normal(n), lambda s: (1800 + 900 * np.sin(s * 40), 6500 + 1500 * np.sin(s * 33)), 'band')
    return fades(x * lp(strokes, 60, 1) * 1.4, 0.01, 0.05)


def blip(f):
    n = ns(0.12)
    t = tt(n)
    return sine(f * (1 + 0.15 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.04) * np.minimum(1, t / 0.002)


# ----------------------------------------------------------------------------- mastering
def master(mix, fade_out=0.9, drive=1.35, ceiling_db=-1.0):
    """Passe-haut, fondu final, saturation douce et normalisation de crête."""
    tsec = tt(N)
    mix = hp(mix, 28, 2)
    mix = mix * (np.clip((DUR - tsec) / fade_out, 0, 1) ** 1.5)[:, None]
    mix[: ns(0.004)] *= np.linspace(0, 1, ns(0.004))[:, None]
    mix = mix / (np.max(np.abs(mix)) + 1e-9)
    mix = np.tanh(drive * mix) / np.tanh(drive)
    return mix * 10 ** (ceiling_db / 20) / (np.max(np.abs(mix)) + 1e-9)


def write(comp, mix):
    out = os.path.join(ROOT, 'build', comp, 'audio.wav')
    wavfile.write(out, SR, (mix * 32767).astype(np.int16))
    return out


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
