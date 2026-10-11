#!/usr/bin/env python3
"""
Bande-son de « Publicité Facebook immobilier » (32 s) — 100 % synthétisée.

  python3 scripts/score_facebook.py   → build/facebook/audio.wav

Style « tech-house sombre » des motion designs produit (demandé en référence) :
intro atmosphérique, « drop » sur un boum de sub, kick 808 profond sur chaque
temps dont la traîne sert de basse, peu de médiums, roulements avant les
transitions, fin lumineuse (note de sub tenue + cloche). 120 BPM, fa# mineur → la majeur.
  0–4 s    nappe sombre, tic-tac, montée → boum de sub à 4 s
  4–20 s   groove (fa#m – la – mi – sim) sous les 5 étapes ; chaque étape sonne une note
  20 s     relance sur « Et on s'occupe de tout » (stabs, charleston ouverte)
  24 s     respiration sous le témoignage (sans kick) : sim – ré – mi …
  28 s     … la majeur : impact, sub tenu et cloche sous la signature
Les effets d'interface sont posés sur les repères exportés par la timeline.

Voix off : les prises de compositions/facebook/voix/ (voir scripts/voix_facebook.py) sont
placées selon voix.json, compressées, et la musique s'efface sous la voix. Le script
écrit audio.wav (avec voix) et audio_sans_voix.wav (musique et effets seuls).
"""
import json
import math
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S  # noqa: E402

COMP = 'facebook'
DUR, CUES = S.load_cues(COMP)
S.setup(DUR, seed=31)
N, ns, tt = S.N, S.ns, S.tt
rng = S.rng

DROP, CLAPS, ARPS, LIFT, BREAKDOWN, BREAK, FINAL = 4.0, 8.0, 12.0, 20.0, 24.0, 27.75, 28.0

#            début  fin   basse (kick 808)  voicing (nappe / stabs)
CHORDS = [(0.0, 4.0, 42, [54, 61, 64, 68]),      # F#m(add9)  intro
          (4.0, 8.0, 42, [54, 57, 61, 64]),      # F#m        1. il voit votre publicité
          (8.0, 12.0, 45, [57, 61, 64, 69]),     # A          2. il demande une estimation
          (12.0, 16.0, 40, [56, 59, 64, 68]),    # E          3. contact, 4. rappel
          (16.0, 20.0, 47, [54, 59, 62, 66]),    # Bm         5. mandat
          (20.0, 22.0, 42, [54, 57, 61, 64]),    # F#m        on s'occupe de tout
          (22.0, 24.0, 40, [56, 59, 64, 68]),    # E
          (24.0, 26.0, 47, [54, 59, 62, 66]),    # Bm         témoignage
          (26.0, 27.0, 50, [54, 57, 62, 66]),    # D
          (27.0, 28.0, 40, [56, 59, 62, 64]),    # E7
          (28.0, DUR, 45, [57, 61, 64, 68, 71])]  # Amaj9 final
ARP = {42: [66, 69, 73, 76, 73, 69, 68, 69], 45: [69, 73, 76, 81, 76, 73, 71, 73],
       40: [68, 71, 76, 80, 76, 71, 68, 71], 47: [66, 71, 74, 78, 74, 71, 69, 71]}


def chord_at(t):
    for c in CHORDS:
        if c[0] <= t < c[1]:
            return c
    return CHORDS[-1]


# ---------------------------------------------------------------- instruments propres à ce style
def kick808(root_midi, tail=0.32, punch=1.9):
    """Kick 808 : attaque claquante, puis note grave accordée sur la basse (longue traîne)."""
    n = ns(0.62)
    t = tt(n)
    f1 = float(S.mtof(root_midi))
    f = f1 + (170 - f1) * np.exp(-t / 0.03)
    body = S.sine(f, n) * np.exp(-t / tail)
    click = S.hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.0035) * 0.5
    x = np.tanh((body + click) * punch) / np.tanh(punch)
    return S.fades(x, 0.0005, 0.08)


def sub_drop(dur=1.8, f0=190.0, f1=40.0):
    """Boum de sub qui plonge (le « drop » des motions produit)."""
    n = ns(dur)
    t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t / 0.11)
    x = np.tanh(2.4 * S.sine(f, n) * np.exp(-t / 0.6))
    noise = S.lp(rng.standard_normal(n), 1600) * np.exp(-t / 0.05) * 0.45
    return S.fades(x * 0.9 + noise, 0.001, 0.2)


def rev_cymbal(dur=1.0):
    c = S.crash(dur * 1.4)[: ns(dur)]
    return S.fades(c[::-1].copy(), 0.01, 0.005)


def rim():
    n = ns(0.06)
    t = tt(n)
    return (S.bp(rng.standard_normal(n), 1800, 5200) * np.exp(-t / 0.006) * 0.7 + S.sine(1720, n) * np.exp(-t / 0.012) * 0.35)


def tick_hat(level=1.0):
    """Charleston très serrée, un peu métallique (tic-tac)."""
    n = ns(0.04)
    t = tt(n)
    x = S.hp(rng.standard_normal(n), 8000, 4) * np.exp(-t / 0.008)
    return x * level


def stab(notes, dur=0.32):
    """Stab d'accord house : supersaw filtré, attaque nette, chute rapide."""
    n = ns(dur)
    t = tt(n)
    x = sum(S.supersaw(m, n, 5, 0.16) for m in notes) / len(notes)
    x = S.sweep(x, lambda s: 700 + 4200 * np.exp(-s / 0.09), 'low')
    return S.fades(x * np.exp(-t / 0.14) * np.minimum(1, t / 0.002), 0.001, 0.03)


def offbass(midi, dur=0.2):
    """Basse en contretemps (une octave au-dessus du kick), courte et ronde."""
    n = ns(dur)
    t = tt(n)
    f = float(S.mtof(midi))
    x = S.lp(S.saw(f, n), 380) * 0.75 + S.sine(f, n) * 0.4
    return S.fades(x * np.exp(-t / 0.09) * np.minimum(1, t / 0.004), 0.002, 0.02)


drums, bass, pad_b, arp_b, stabs_b, fx, send = (S.Bus() for _ in range(7))

# ---------------------------------------------------------------- batterie
kicks = [t for t in np.arange(DROP, BREAKDOWN, 0.5)]
for t in kicks:
    root = chord_at(t + 1e-3)[2] - 12          # traîne du kick accordée sur la basse de l'accord
    drums.add(kick808(root), t, 0.95)
drums.add(kick808(45 - 12, tail=0.6), FINAL, 1.0)
for t in np.arange(CLAPS + 0.5, BREAKDOWN, 1.0):          # clap sur 2 et 4
    c = S.clap()
    drums.add(c, t, 0.32, pan=0.04)
    send.add(c, t, 0.14)
for k, t in enumerate(np.arange(0.5, BREAKDOWN, 0.5)):    # charleston sur les contretemps (dès l'intro, très douce)
    g = 0.1 if t < DROP else 0.24
    drums.add(tick_hat(), t + 0.25, g, pan=0.22)
for k, t in enumerate(np.arange(DROP, BREAKDOWN, 0.125)):  # doubles-croches très discrètes
    if k % 4 == 2:
        continue
    drums.add(tick_hat(0.6), t, 0.07 + 0.04 * (k % 2), pan=-0.3)
for t in np.arange(LIFT + 0.25, BREAKDOWN, 0.5):          # charleston ouverte sur la relance
    drums.add(S.hat(True), t, 0.12, pan=-0.15)
RIMS = [0.75, 1.75, 2.25, 3.5]                              # petites percussions syncopées, par mesure
for bar in np.arange(DROP, BREAKDOWN, 2.0):
    for off in RIMS:
        if bar + off < BREAKDOWN and not (bar < CLAPS and off == 3.5):
            drums.add(rim(), bar + off, 0.12, pan=(0.45 if off % 1 else -0.45))
for k, t in enumerate(np.arange(0.0, DROP - 0.2, 0.5)):  # tic-tac de l'intro
    drums.add(rim(), t, 0.05 if k % 2 else 0.08, pan=0.35)
for k, t in enumerate(np.arange(1.0, DROP - 0.4, 0.5)):   # pulsation étouffée qui monte vers le drop
    p = (t - 1.0) / (DROP - 1.4)
    drums.add(S.lp(kick808(30, tail=0.22), 180), t, 0.18 + 0.32 * p)
for lo, hi in ((LIFT - 1.0, LIFT), (FINAL - 1.25, BREAK)):   # roulements avant les relances
    steps = np.arange(lo, hi - 0.01, 0.0625)
    for k, t in enumerate(steps):
        drums.add(S.snare(0.2 + 0.8 * (k / len(steps)) ** 1.5), t, 0.24)
drums.add(S.crash(2.6), DROP, 0.3)
drums.add(S.crash(2.4), LIFT, 0.36)
drums.add(S.crash(3.6), FINAL, 0.5)

sc = S.sidechain(kicks, depth=0.7, tau=0.11)

# ---------------------------------------------------------------- basse en contretemps
for k, t in enumerate(np.arange(DROP + 0.25, BREAKDOWN, 0.5)):
    root = chord_at(t + 1e-3)[2]
    bass.add(offbass(root + (12 if k % 4 == 3 else 0)), t, 0.32)
# notes tenues sous le témoignage, puis sub tenu final (la grave)
for (a, b, root, notes) in CHORDS:
    if BREAKDOWN <= a < BREAK:
        d = min(b, BREAK) - a
        n = ns(d + 0.15)
        x = S.sine(S.mtof(root - 12), n) * 0.8 + S.lp(S.saw(S.mtof(root), n), 300) * 0.25
        env = np.minimum(1, tt(n) / 0.08) * np.clip((d + 0.15 - tt(n)) / 0.25, 0, 1)
        bass.add(S.fades(x * env, 0.005, 0.05), a, 0.17)
n = ns(1.8)
bass.add(S.fades(np.tanh(1.6 * S.sine(S.mtof(33), n)) * np.minimum(1, tt(n) / 0.01) * np.clip((1.8 - tt(n)) / 0.6, 0, 1), 0.005, 0.1), FINAL, 0.4)

# ---------------------------------------------------------------- nappe sombre (pompe avec le kick)
for (a, b, root, notes) in CHORDS:
    n = ns(b - a + 0.5)
    t = tt(n)
    L = sum(S.supersaw(m, n, 5, 0.12) for m in notes) / len(notes)
    R = sum(S.supersaw(m, n, 5, 0.12) for m in notes) / len(notes)
    att = 1.2 if a == 0 else 0.06
    env = np.minimum(1, t / att) * np.clip((b - a + 0.5 - t) / 0.5, 0, 1)
    pad_b.add(np.stack([L * env, R * env], 1), a, 1.0)
cut = lambda s: (500 + 700 * s / DROP) if s < DROP else (950 if s < LIFT else (2000 if s < BREAKDOWN else (1500 if s < FINAL else 3000 * np.exp(-(s - FINAL) / 1.4) + 800)))
pad = np.stack([S.sweep(pad_b.x[:, c], cut, 'low') for c in range(2)], 1)
tsec = tt(N)
pad_gain = np.interp(tsec, [0, 2.0, DROP - 0.01, DROP, LIFT - 0.01, LIFT, BREAKDOWN, BREAK, FINAL, DUR],
                     [0.0, 1.0, 1.15, 0.5, 0.45, 0.6, 0.85, 0.85, 1.0, 0.6])
pad *= (pad_gain * np.where((tsec >= DROP) & (tsec < BREAKDOWN), sc, 1.0))[:, None] * 0.5

# ---------------------------------------------------------------- arpège filtré (mouvement discret)
for k, t in enumerate(np.arange(ARPS, BREAKDOWN, 0.25)):
    m = ARP[chord_at(t + 1e-3)[2]][k % 8]
    arp_b.add(S.pluck(m, 0.2, bright=2400), t, (0.34 if k % 2 == 0 else 0.22) * (1.2 if t >= LIFT else 1.0), pan=(-0.4 if k % 2 else 0.4))
for k, t in enumerate(np.arange(FINAL + 0.5, DUR - 1.0, 0.25)):
    m = [88, 85, 81, 76, 81, 85, 88, 93][k % 8]
    arp_b.add(S.pluck(m, 0.3, bright=2800), t, 0.24 * (1 - (t - FINAL) / 4), pan=(-0.5 if k % 2 else 0.5))
arp = arp_b.x + S.pingpong(arp_b.x.mean(axis=1)) * 0.55
arp *= np.where((tsec >= DROP) & (tsec < BREAKDOWN), 0.5 + 0.5 * sc, 1.0)[:, None]

# ---------------------------------------------------------------- stabs d'accords sur la relance
for t in np.arange(LIFT, BREAKDOWN, 0.5):
    notes = chord_at(t + 0.25)[3]
    stabs_b.add(stab([m + 12 for m in notes]), t + 0.25, 1.1, pan=0.0)

# ---------------------------------------------------------------- montées, boums, cymbales inversées
fx.add(S.riser(1.6, tone=(54, 66)), DROP - 1.6, 0.2)
fx.add(rev_cymbal(1.0), DROP - 1.0, 0.3)
fx.add(sub_drop(), DROP, 0.55)
fx.add(rev_cymbal(0.8), LIFT - 0.8, 0.26)
fx.add(sub_drop(1.4, 170, 44), LIFT, 0.4)
fx.add(S.riser(1.2, tone=(52, 64)), BREAK - 1.2, 0.22)
fx.add(rev_cymbal(0.75), BREAK - 0.75, 0.26)
fx.add(sub_drop(2.2, 200, 36), FINAL, 0.6)

# ---------------------------------------------------------------- effets sur repères
def nth(ctype):
    """Rang d'un repère parmi ceux de son type (pour monter la gamme au fil des apparitions)."""
    times = sorted(c['t'] for c in CUES if c['type'] == ctype)
    return lambda c: times.index(c['t'])


# gamme pentatonique de la majeur / fa# mineur (la si do# mi fa#)
PENTA = [440.0, 493.88, 554.37, 659.26, 739.99, 880.0, 987.77, 1108.73, 1318.51, 1479.98, 1760.0, 1975.53, 2217.46, 2637.02]
bubble_k, react_k, star_k, step_k = nth('bubble'), nth('react'), nth('star'), nth('step')
STEP_NOTES = [73, 76, 81, 83, 86]     # do#, mi, la, si, ré : toujours une note de l'accord joué


def bubble(c):
    f = PENTA[2 + bubble_k(c) % 10]
    return S.pop(f * 0.6, f, 0.09)


def react(c):
    return S.blip(PENTA[7 + react_k(c) % 6])


def star(c):
    return S.blip(PENTA[5 + star_k(c) % 8])


def step(c):
    m = STEP_NOTES[step_k(c) % len(STEP_NOTES)]
    n = ns(1.2)
    return S.bell(float(S.mtof(m)), n, 0.7) * 0.5 + np.pad(S.pluck(m, 0.3, 4200), (0, n - ns(0.3))) * 0.35


def chord_chime(c, count=2):
    """Carillon sur les notes les plus hautes de l'accord joué (toujours consonant)."""
    notes = sorted(set(m % 12 for m in chord_at(c['t'])[3]))
    freqs = [float(S.mtof(84 + m)) for m in notes][-count:]
    return S.chime(tuple(freqs))


def sparkle_on_chord(c):
    notes = sorted(set(m % 12 for m in chord_at(c['t'])[3]))
    freqs = [float(S.mtof(96 + n)) for n in notes][:4]
    return S.sparkle(tuple(freqs))


def tap(c):
    n = ns(0.08)
    thump = np.pad(S.pop(300, 190, 0.06), (0, n - ns(0.06)))
    return np.pad(S.click(2600, 0.005), (0, n - ns(0.04))) * 0.7 + thump * 0.6


def buzz(c):
    """Vibreur de téléphone : moteur grave, légèrement irrégulier."""
    d = 0.5
    n = ns(d)
    t = tt(n)
    x = S.lp(np.sign(np.sin(2 * np.pi * 172 * t)) * 0.6 + S.sine(172, n) * 0.4, 1100)
    env = np.minimum(1, t / 0.015) * np.clip((d - t) / 0.06, 0, 1) * (0.75 + 0.25 * np.sin(2 * np.pi * 23 * t))
    return x * env


def ringback(c):
    """Tonalité de retour d'appel (440 Hz, comme en France)."""
    d = 0.75
    n = ns(d)
    t = tt(n)
    env = np.minimum(1, t / 0.03) * np.clip((d - t) / 0.08, 0, 1)
    return (S.sine(440, n) + 0.15 * S.sine(880, n)) * env * 0.5


def flip(c):
    w = S.whoosh(0.42, 500, 3200).mean(axis=1)
    k = S.click(2000, 0.004)
    i = ns(0.24)
    w[i:i + len(k)] += k[:max(0, len(w) - i)] * 0.6
    return w


SFX = {
    'type': (lambda c: S.click(3000 + S.rng.random() * 1500), 0.12, 0.03),
    'pop': (lambda c: S.pop(420, 820, 0.09), 0.3, 0.12),
    'bubble': (bubble, 0.15, 0.15),
    'react': (react, 0.13, 0.2),
    'star': (star, 0.05, 0.1),
    'step': (step, 0.28, 0.35),
    'tap': (tap, 0.34, 0.05),
    'click': (lambda c: S.click(2400, 0.006), 0.32, 0.06),
    'swipe': (lambda c: S.whoosh(0.32, 900, 4200), 0.16, 0.08),
    'whoosh': (lambda c: S.whoosh(0.5, 250, 2400, rumble=0.3), 0.28, 0.12),
    'swoosh': (lambda c: S.whoosh(0.38, 450, 3400), 0.22, 0.1),
    'flip': (flip, 0.26, 0.1),
    'drop': (lambda c: S.pop(1100, 560, 0.1), 0.26, 0.15),
    'gold': (sparkle_on_chord, 0.28, 0.4),
    'notif': (chord_chime, 0.36, 0.3),
    'success': (lambda c: S.chime((880.0, 1108.73, 1318.51), 0.07, 0.35), 0.34, 0.3),   # la-do#-mi (A)
    'buzz': (buzz, 0.2, 0.0),
    'ring': (ringback, 0.12, 0.1),
    'tick': (lambda c: S.tick(), 0.24, 0.1),
    'scribble': (lambda c: S.scribble(), 0.5, 0.05),
    'stamp': (lambda c: S.stamp(), 0.55, 0.15),
    'riser_short': (lambda c: S.riser(0.5, tone=(54, 66)), 0.26, 0.2),
    'hit': (lambda c: S.stab([66, 69, 73, 78, 81], 1.2, 0.3) * 0.6 + np.pad(S.impact(), (0, ns(1.2) - ns(0.9))) * 0.6, 0.38, 0.35),
    'zip': (lambda c: S.zip_(), 0.2, 0.1),
    'counter': (lambda c: S.counter_ticks(18, 1.0), 0.28, 0.05),
    'logo': (lambda c: S.sparkle((880.0, 1108.73, 1318.51, 1760.0), 0.06, 0.9), 0.36, 0.55),   # la majeur
}
missing = set()
for c in CUES:
    spec = SFX.get(c['type'])
    if spec is None:
        missing.add(c['type'])
        continue
    fn, g, s_send = spec
    s = S.fades(fn(c), 0.001, 0.03)
    gain = g * c.get('gain', 1.0)
    fx.add(s, c['t'], gain)
    if s_send:
        send.add(s, c['t'], gain * s_send)
if missing:
    print('repères sans effet :', sorted(missing))

# ---------------------------------------------------------------- réverbération + mixage
ir = S.make_ir(2.6, damp=4200)
send.x += pad * 0.25 + arp * 0.35 + stabs_b.x * 0.3
wet = S.reverb(send.x, ir) * 0.5

gate = np.ones(N)
gate[(tsec >= BREAK) & (tsec < FINAL)] = 0.0      # silence juste avant l'impact final
gate = S.lp(gate, 60, 1)
stabs = stabs_b.x * sc[:, None]
music = drums.x * 0.62 + bass.x * (sc[:, None] * 0.8 + 0.2) + pad + arp * 0.75 + stabs * 0.8
music[:, 0] *= gate
music[:, 1] *= gate

if os.environ.get('STEMS'):
    for name, x in (('batterie', drums.x * 0.62), ('basse', bass.x), ('nappe', pad), ('arpège', arp * 0.75), ('stabs', stabs * 0.8), ('effets', fx.x), ('réverb', wet)):
        print(f'{name:10s}', ' '.join(f'{S.rms_db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 4), (4, 20), (20, 24), (24, 28), (28, 32))))

# ---------------------------------------------------------------- voix off (compositions/facebook/voix)
def load_voice():
    """Piste de voix off placée selon voix.json (une prise par ligne), ou None s'il n'y en a pas."""
    d = os.path.join(S.ROOT, 'compositions', COMP, 'voix')
    if not os.path.exists(os.path.join(d, 'voix.json')):
        return None
    cfg = json.load(open(os.path.join(d, 'voix.json'), encoding='utf-8'))
    vo = np.zeros(N)
    for line in cfg['lignes']:
        sr, x = wavfile.read(os.path.join(d, line['fichier']))
        x = x.astype(float) / 32768 if x.dtype == np.int16 else x.astype(float)
        if x.ndim > 1:
            x = x.mean(axis=1)
        if sr != S.SR:
            g = math.gcd(S.SR, sr)
            x = signal.resample_poly(x, S.SR // g, sr // g)
        env = S.lp(np.abs(x), 20, 1)
        voiced = x[env > 0.1 * env.max()]
        x = S.fades(x / (np.sqrt(np.mean(voiced ** 2)) + 1e-9) * 0.1, 0.01, 0.04)   # chaque ligne au même niveau
        i0 = int(round(line['debut'] * S.SR))
        n = min(len(x), N - i0)
        vo[i0:i0 + n] += x[:n]
    return vo


def compress(x, thr_db=-22.0, ratio=3.0, att=0.005, rel=0.12):
    """Compresseur simple (détection RMS, attaque/relâchement lissés)."""
    env = np.sqrt(S.lp(x ** 2, 30, 1).clip(1e-12))
    lvl = 20 * np.log10(env)
    gain_db = np.minimum(0.0, (thr_db - lvl) * (1 - 1 / ratio))
    g = np.empty_like(gain_db)
    a, r, cur = np.exp(-1 / (att * S.SR)), np.exp(-1 / (rel * S.SR)), 0.0
    for i, v in enumerate(gain_db):
        cur = a * cur + (1 - a) * v if v < cur else r * cur + (1 - r) * v
        g[i] = cur
    return x * 10 ** (g / 20)


def write_wav(name, mix):
    out = os.path.join(S.ROOT, 'build', COMP, name)
    wavfile.write(out, S.SR, (mix * 32767).astype(np.int16))
    return out


vo = load_voice()
plain = S.master(music + fx.x * 1.25 + wet, fade_out=1.2, drive=1.35)
if vo is None:
    print(S.write(COMP, plain), f'{DUR:.2f} s')
else:
    # voix : passe-haut, présence, compression, une pointe de réverbération courte
    vo = S.hp(vo, 90, 2)
    vo = vo + 0.3 * S.bp(vo, 2500, 6500)
    vo = compress(vo)
    vo_st = S.stereo(vo)
    vo_wet = S.reverb(vo_st, S.make_ir(0.5, damp=6500)) * 0.05
    # la musique s'efface sous la voix (avec 80 ms d'anticipation), les bruitages un peu moins
    env = S.lp(np.abs(vo), 8, 1)
    active = np.clip((20 * np.log10(env + 1e-9) + 46) / 10, 0, 1)
    k = ns(0.08)
    active = maximum_filter1d(np.concatenate([active[k:], np.zeros(k)]), size=ns(0.25))
    active = S.lp(active, 3, 1).clip(0, 1)
    duck_m, duck_fx = (1 - 0.68 * active)[:, None], (1 - 0.75 * active)[:, None]
    bed_in = music * duck_m + fx.x * 1.25 * duck_fx + wet * duck_m
    bed_in -= 0.5 * active[:, None] * S.bp(bed_in, 800, 4000)     # creux dans les fréquences de la voix
    bed = S.master(bed_in, fade_out=1.2, drive=1.35)
    m = active > 0.9
    bed_rms = np.sqrt(np.mean(bed[m] ** 2))
    vo_rms = np.sqrt(np.mean(vo_st[m & (env > 0.05 * env.max())] ** 2))
    g = bed_rms / vo_rms * 10 ** (8.0 / 20)        # voix 8 dB au-dessus du fond
    mix = bed + (vo_st + vo_wet) * g
    mix *= min(1.0, 0.89 / np.max(np.abs(mix)))
    print(S.write(COMP, mix), f'{DUR:.2f} s (avec voix off)')
    print(write_wav('audio_sans_voix.wav', plain), '(sans voix off)')
