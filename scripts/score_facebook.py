#!/usr/bin/env python3
"""
Bande-son de « Publicité Facebook immobilier » (32 s) — 100 % synthétisée.

  python3 scripts/score_facebook.py   → build/facebook/audio.wav

Pop lumineuse, 120 BPM, do majeur :
  0–4 s    intro légère (fa → sol), bulles et réactions des propriétaires
  4–20 s   groove (do – sol – lam – fa) sous les 5 étapes ; chaque étape sonne une note
           de plus haut en plus haut (mi, sol, la, do, mi)
  20 s     relance sur « Et on s'occupe de tout » (kick 4/4)
  24 s     respiration sous le témoignage (sans batterie), montée vers…
  28 s     l'accord final de do sous la signature, qui résonne jusqu'à 32 s
Les effets d'interface sont posés sur les repères exportés par la timeline.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S  # noqa: E402

COMP = 'facebook'
DUR, CUES = S.load_cues(COMP)
S.setup(DUR, seed=23)
N, ns, tt = S.N, S.ns, S.tt

INTRO, ARPS, LIFT, DROP, BREAK, FINAL = 4.0, 10.0, 20.0, 24.0, 27.75, 28.0

#            début  fin   basse  voicing (piano / pad)
CHORDS = [(0.0, 2.0, 41, [57, 60, 65, 67]),      # F(add9)
          (2.0, 4.0, 43, [55, 59, 62, 67]),      # G
          (4.0, 6.0, 48, [55, 60, 64, 67]),      # C          1. il voit votre publicité
          (6.0, 8.0, 43, [55, 59, 62, 67]),      # G
          (8.0, 10.0, 45, [57, 60, 64, 69]),     # Am         2. il demande une estimation
          (10.0, 12.0, 41, [57, 60, 65, 69]),    # F          3. vous recevez le contact
          (12.0, 14.0, 48, [55, 60, 64, 67]),    # C
          (14.0, 16.0, 43, [55, 59, 62, 67]),    # G          4. vous le rappelez
          (16.0, 18.0, 45, [57, 60, 64, 69]),    # Am         5. vous signez le mandat
          (18.0, 20.0, 41, [57, 60, 65, 69]),    # F
          (20.0, 22.0, 48, [55, 60, 64, 67]),    # C          on s'occupe de tout
          (22.0, 24.0, 43, [55, 59, 62, 67]),    # G
          (24.0, 26.0, 45, [57, 60, 64, 69]),    # Am         témoignage
          (26.0, 27.0, 41, [57, 60, 65, 69]),    # F
          (27.0, 28.0, 43, [55, 59, 62, 65]),    # G7
          (28.0, DUR, 36, [60, 64, 67, 72, 74])]  # Cadd9 final
ARP = {48: [72, 76, 79, 84, 79, 76, 74, 76], 43: [71, 74, 79, 83, 79, 74, 71, 74],
       45: [69, 72, 76, 81, 76, 72, 71, 72], 41: [69, 72, 77, 81, 77, 72, 69, 72]}


def chord_at(t):
    for c in CHORDS:
        if c[0] <= t < c[1]:
            return c
    return CHORDS[-1]


drums, bass, keys_b, pad_b, arp_b, fx, send = (S.Bus() for _ in range(7))

# ---------------------------------------------------------------- batterie
kicks = [t for t in np.arange(INTRO, LIFT, 1.0)] + [t for t in np.arange(LIFT, DROP, 0.5)] + [FINAL]
for t in kicks:
    drums.add(S.kick(decay=0.15), t, 0.85)
for t in np.arange(INTRO + 0.5, DROP, 1.0):
    c = S.clap()
    drums.add(c, t, 0.3, pan=0.05)
    send.add(c, t, 0.1)
for k, t in enumerate(np.arange(INTRO, DROP, 0.25)):
    drums.add(S.hat(), t, (0.3 if k % 2 else 0.18), pan=0.25)
for t in np.arange(LIFT + 0.25, DROP, 0.5):
    drums.add(S.hat(True), t, 0.13, pan=-0.2)
for k, t in enumerate(np.arange(1.0, BREAK, 0.125)):        # shaker : de l'intro au témoignage
    g = 0.6 if t < INTRO else (0.55 if t >= DROP else 1.0)
    drums.add(S.shaker(), t, (0.16 if k % 2 else 0.08) * g, pan=-0.35)
for k, t in enumerate(np.arange(LIFT - 0.5, LIFT - 0.02, 0.0625)):   # petit roulement avant la relance
    drums.add(S.snare(0.25 + 0.75 * k / 8), t, 0.26)
drums.add(S.crash(2.4), INTRO, 0.32)
drums.add(S.crash(2.4), LIFT, 0.4)
drums.add(S.crash(3.6), FINAL, 0.55)

sc = S.sidechain([t for t in kicks if t < DROP], depth=0.55)

# ---------------------------------------------------------------- basse
for k, t in enumerate(np.arange(INTRO, DROP, 0.25)):          # croches avec rebond d'octave
    root = chord_at(t + 1e-3)[2]
    m = root + (12 if k % 4 == 2 else 0)
    n = ns(0.23)
    x = S.lp(S.saw(S.mtof(m), n), 900) * 0.8 + S.sine(S.mtof(m) / 2, n) * 0.3
    env = np.exp(-tt(n) / 0.18) * np.minimum(1, tt(n) / 0.004)
    bass.add(S.fades(x * env, 0.002, 0.02), t, 0.42)
for (a, b, root, notes) in CHORDS:                             # notes tenues sous le témoignage
    if DROP <= a < BREAK:
        d = min(b, BREAK) - a
        n = ns(d + 0.2)
        x = S.lp(S.saw(S.mtof(root), n), 500) * 0.5 + S.sine(S.mtof(root) / 2, n) * 0.5
        env = np.minimum(1, tt(n) / 0.05) * np.clip((d + 0.2 - tt(n)) / 0.3, 0, 1)
        bass.add(S.fades(x * env, 0.005, 0.05), a, 0.2)
n = ns(DUR - FINAL)
bass.add(S.fades(S.sine(S.mtof(36), n) * 0.5 * np.exp(-tt(n) / 1.6), 0.01, 0.3), FINAL, 0.38)

# ---------------------------------------------------------------- piano électrique
for (a, b, root, notes) in CHORDS:
    if a < INTRO:
        keys_b.add(S.keys(notes, b - a, 0.55, tone=1.4), a, 1.0)
    elif a >= FINAL:
        keys_b.add(S.keys(notes, b - a, 0.9, tone=2.4), a, 1.0)
    elif a >= DROP:   # témoignage : accords tenus, plus doux
        keys_b.add(S.keys(notes, b - a, 0.6, tone=1.5), a, 0.9)
        keys_b.add(S.keys([notes[-1] + 12], 0.6, 0.35, tone=1.2), a + 1.0 if b - a > 1.5 else a + 0.5, 0.7, pan=0.3)
    else:   # syncopes : temps 1, « et » du 2, temps 4
        for off, d, v in ((0.0, 0.45, 1.0), (0.75, 0.4, 0.75), (1.5, 0.45, 0.85)):
            if a + off < b:
                keys_b.add(S.keys(notes, d, v), a + off, 0.85, pan=0.1)

# ---------------------------------------------------------------- pad (supersaw doux)
for (a, b, root, notes) in CHORDS:
    if a < INTRO:
        continue
    n = ns(b - a + 0.4)
    t = tt(n)
    L = sum(S.supersaw(m, n) for m in notes) / len(notes)
    R = sum(S.supersaw(m, n) for m in notes) / len(notes)
    env = np.minimum(1, t / 0.08) * np.clip((b - a + 0.4 - t) / 0.4, 0, 1)
    pad_b.add(np.stack([L * env, R * env], 1), a, 1.0)
cut = lambda s: 1400 if s < LIFT else (2600 if s < DROP else (1700 if s < FINAL else 3600 * np.exp(-(s - FINAL) / 1.6) + 900))
pad = np.stack([S.sweep(pad_b.x[:, c], cut, 'low') for c in range(2)], 1)
tsec = tt(N)
pad_gain = np.interp(tsec, [0, INTRO, LIFT - 0.01, LIFT, DROP - 0.01, DROP, BREAK, FINAL, DUR],
                     [0, 0.45, 0.45, 0.8, 0.8, 0.75, 0.75, 1.0, 0.6])
pad *= (pad_gain * np.where(tsec < DROP, sc, 1.0))[:, None] * 0.55

# ---------------------------------------------------------------- arpèges
for k, t in enumerate(np.arange(ARPS, DROP, 0.125)):
    m = ARP[chord_at(t + 1e-3)[2]][k % 8]
    arp_b.add(S.pluck(m, bright=3800), t, (0.42 if k % 2 == 0 else 0.28) * (1.15 if t >= LIFT else 1.0), pan=(-0.35 if k % 2 else 0.35))
for k, t in enumerate(np.arange(DROP, BREAK - 0.1, 0.25)):     # témoignage : croches, plus légères
    m = ARP[chord_at(t + 1e-3)[2]][(2 * k) % 8]
    arp_b.add(S.pluck(m, 0.3, bright=2600), t, 0.24, pan=(-0.4 if k % 2 else 0.4))
for k, t in enumerate(np.arange(FINAL + 0.5, DUR - 1.0, 0.25)):
    m = [84, 79, 76, 72, 74, 76, 79, 84][k % 8]
    arp_b.add(S.pluck(m, 0.3, bright=3000), t, 0.3 * (1 - (t - FINAL) / 4), pan=(-0.5 if k % 2 else 0.5))
arp = arp_b.x + S.pingpong(arp_b.x.mean(axis=1)) * 0.5
arp *= np.where(tsec < DROP, 0.6 + 0.4 * sc, 1.0)[:, None]

# ---------------------------------------------------------------- montées
fx.add(S.riser(1.0, tone=(60, 72)), INTRO - 1.0, 0.16)
fx.add(S.riser(1.0, tone=(55, 67)), BREAK - 1.0, 0.2)

# ---------------------------------------------------------------- effets sur repères
def nth(ctype):
    """Rang d'un repère parmi ceux de son type (pour monter la gamme au fil des apparitions)."""
    times = sorted(c['t'] for c in CUES if c['type'] == ctype)
    return lambda c: times.index(c['t'])


PENTA = [523.25, 587.33, 659.26, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0, 2349.32, 2637.02]
bubble_k, react_k, star_k, step_k = nth('bubble'), nth('react'), nth('star'), nth('step')
STEP_NOTES = [76, 79, 81, 84, 88]     # mi, sol, la, do, mi : toujours une note de l'accord joué


def bubble(c):
    f = PENTA[bubble_k(c) % len(PENTA)]
    return S.pop(f * 0.6, f, 0.1)


def react(c):
    return S.blip(PENTA[7 + react_k(c) % 6])


def star(c):
    return S.blip(PENTA[5 + star_k(c) % 8])


def step(c):
    f = float(S.mtof(STEP_NOTES[step_k(c) % len(STEP_NOTES)]))
    n = ns(1.2)
    return S.bell(f, n, 0.7) * 0.5 + np.pad(S.pluck(STEP_NOTES[step_k(c) % 5], 0.3, 4200), (0, n - ns(0.3))) * 0.35


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
    thump = np.pad(S.pop(320, 200, 0.06), (0, n - ns(0.06)))
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
    'pop': (lambda c: S.pop(), 0.3, 0.12),
    'bubble': (bubble, 0.16, 0.15),
    'react': (react, 0.14, 0.2),
    'star': (star, 0.16, 0.2),
    'step': (step, 0.3, 0.35),
    'tap': (tap, 0.34, 0.05),
    'click': (lambda c: S.click(2400, 0.006), 0.32, 0.06),
    'swipe': (lambda c: S.whoosh(0.32, 900, 4200), 0.16, 0.08),
    'whoosh': (lambda c: S.whoosh(0.5), 0.26, 0.12),
    'swoosh': (lambda c: S.whoosh(0.38, 500, 3600), 0.22, 0.1),
    'flip': (flip, 0.26, 0.1),
    'drop': (lambda c: S.pop(1300, 650, 0.1), 0.26, 0.15),
    'gold': (sparkle_on_chord, 0.3, 0.4),
    'notif': (chord_chime, 0.36, 0.3),
    'success': (lambda c: S.chime((880.0, 1046.5, 1318.51), 0.07, 0.35), 0.34, 0.3),   # la-do-mi (Am)
    'buzz': (buzz, 0.2, 0.0),
    'ring': (ringback, 0.12, 0.1),
    'tick': (lambda c: S.tick(), 0.26, 0.1),
    'scribble': (lambda c: S.scribble(), 0.5, 0.05),
    'stamp': (lambda c: S.stamp(), 0.55, 0.15),
    'riser_short': (lambda c: S.riser(0.5, tone=(60, 72)), 0.28, 0.2),
    'hit': (lambda c: S.stab([60, 64, 67, 72, 76], 1.4) * 0.8 + np.pad(S.impact(), (0, ns(1.4) - ns(0.9))) * 0.5, 0.5, 0.35),
    'zip': (lambda c: S.zip_(), 0.2, 0.1),
    'counter': (lambda c: S.counter_ticks(18, 1.0), 0.3, 0.05),
    'logo': (lambda c: S.sparkle((1046.5, 1318.51, 1567.98, 2093.0), 0.05, 0.7), 0.34, 0.5),   # do majeur
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
ir = S.make_ir(2.2)
send.x += pad * 0.2 + arp * 0.3 + keys_b.x * 0.18
wet = S.reverb(send.x, ir) * 0.45

gate = np.ones(N)
gate[(tsec >= BREAK) & (tsec < FINAL)] = 0.0      # respiration avant l'accord final
gate = S.lp(gate, 60, 1)
music = drums.x * 0.5 + bass.x * (sc[:, None] * 0.85 + 0.15) + keys_b.x * 0.55 + pad + arp * 0.9
music[:, 0] *= gate
music[:, 1] *= gate

if os.environ.get('STEMS'):
    for name, x in (('batterie', drums.x * 0.5), ('basse', bass.x), ('piano', keys_b.x * 0.55), ('pad', pad), ('arpèges', arp * 0.9), ('effets', fx.x), ('réverb', wet)):
        print(f'{name:10s}', ' '.join(f'{S.rms_db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 4), (4, 20), (20, 24), (24, 28), (28, 32))))

mix = S.master(music + fx.x * 1.3 + wet, fade_out=1.2, drive=1.25)
print(S.write(COMP, mix), f'{DUR:.2f} s')
