#!/usr/bin/env python3
"""
Bande-son de « Google Ads immobilier » (30 s) — 100 % synthétisée.

  python3 scripts/score_google_ads.py   → build/google-ads/audio.wav

Pop « corporate » lumineuse, 120 BPM, fa majeur :
  0–4 s    intro légère (piano électrique tenu, shaker de frappe au clavier)
  4–16 s   groove (kick 1-3, clap 2-4, basse en croches, piano syncopé, arpèges dès 8 s)
  16 s     relance sur « plus de chiffre d'affaires » (kick 4/4, pad plus large)
  25,75 s  respiration → 26 s accord final sous la signature, qui résonne jusqu'à 30 s
Les effets d'interface sont posés sur les repères exportés par la timeline.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S  # noqa: E402

COMP = 'google-ads'
DUR, CUES = S.load_cues(COMP)
S.setup(DUR, seed=11)
N, ns, tt = S.N, S.ns, S.tt

INTRO, LIFT, BREAK, FINAL = 4.0, 16.0, 25.75, 26.0

#            début  fin   basse  voicing (piano / pad)
CHORDS = [(0.0, 2.0, 41, [57, 60, 64, 65]),      # Fmaj7
          (2.0, 4.0, 40, [55, 60, 64, 67]),      # C/E
          (4.0, 6.0, 41, [57, 60, 65, 67]),      # F(add9)
          (6.0, 8.0, 48, [55, 60, 64, 67]),      # C
          (8.0, 10.0, 50, [57, 60, 62, 65]),     # Dm7
          (10.0, 12.0, 46, [57, 62, 65, 69]),    # Bbmaj7
          (12.0, 14.0, 41, [57, 60, 65, 67]),    # F(add9)
          (14.0, 16.0, 48, [55, 60, 64, 67]),    # C
          (16.0, 18.0, 50, [57, 60, 62, 65]),    # Dm7
          (18.0, 20.0, 46, [57, 62, 65, 69]),    # Bbmaj7
          (20.0, 22.0, 41, [57, 60, 65, 67]),    # F(add9)
          (22.0, 24.0, 48, [55, 60, 64, 67]),    # C
          (24.0, 25.0, 50, [57, 60, 62, 65]),    # Dm7
          (25.0, 26.0, 46, [57, 62, 65, 69]),    # Bbmaj7
          (26.0, DUR, 41, [60, 64, 65, 67, 69])]  # Fmaj9 final
ARP = {41: [65, 69, 72, 77, 72, 69, 67, 69], 40: [64, 67, 72, 76, 72, 67, 64, 67],
       48: [67, 72, 76, 79, 76, 72, 74, 72], 50: [69, 72, 74, 77, 74, 72, 69, 72],
       46: [70, 74, 77, 81, 77, 74, 72, 74]}


def chord_at(t):
    for c in CHORDS:
        if c[0] <= t < c[1]:
            return c
    return CHORDS[-1]


drums, bass, keys_b, pad_b, arp_b, fx, send = (S.Bus() for _ in range(7))

# ---------------------------------------------------------------- batterie
kicks = [t for t in np.arange(INTRO, LIFT, 1.0)] + [t for t in np.arange(LIFT, BREAK, 0.5)] + [FINAL]
for t in kicks:
    drums.add(S.kick(decay=0.15), t, 0.85)
for t in np.arange(INTRO + 0.5, BREAK, 1.0):
    c = S.clap()
    drums.add(c, t, 0.3, pan=0.05)
    send.add(c, t, 0.1)
for k, t in enumerate(np.arange(INTRO, BREAK, 0.25)):
    drums.add(S.hat(), t, (0.3 if k % 2 else 0.18), pan=0.25)
for t in np.arange(LIFT + 0.25, BREAK, 0.5):
    drums.add(S.hat(True), t, 0.13, pan=-0.2)
for k, t in enumerate(np.arange(1.0, BREAK, 0.125)):        # shaker : de la frappe au groove
    drums.add(S.shaker(), t, (0.16 if k % 2 else 0.08) * (0.6 if t < INTRO else 1.0), pan=-0.35)
for k, t in enumerate(np.arange(15.5, 15.98, 0.0625)):       # petit roulement avant la relance
    drums.add(S.snare(0.25 + 0.75 * k / 8), t, 0.28)
drums.add(S.crash(2.4), INTRO, 0.32)
drums.add(S.crash(2.4), LIFT, 0.4)
drums.add(S.crash(3.6), FINAL, 0.55)

sc = S.sidechain([t for t in kicks if t < BREAK], depth=0.55)

# ---------------------------------------------------------------- basse (croches, rebond d'octave)
for k, t in enumerate(np.arange(INTRO, BREAK, 0.25)):
    root = chord_at(t + 1e-3)[2]
    m = root + (12 if k % 4 == 2 else 0)
    n = ns(0.23)
    x = S.lp(S.saw(S.mtof(m), n), 900) * 0.8 + S.sine(S.mtof(m) / 2, n) * 0.3
    env = np.exp(-tt(n) / 0.18) * np.minimum(1, tt(n) / 0.004)
    bass.add(S.fades(x * env, 0.002, 0.02), t, 0.42)
n = ns(DUR - FINAL)
bass.add(S.fades(S.sine(S.mtof(41), n) * 0.5 * np.exp(-tt(n) / 1.6), 0.01, 0.3), FINAL, 0.35)

# ---------------------------------------------------------------- piano électrique
for (a, b, root, notes) in CHORDS:
    if a < INTRO:
        keys_b.add(S.keys(notes, b - a, 0.55, tone=1.4), a, 1.0)
    elif a >= FINAL:
        keys_b.add(S.keys(notes, b - a, 0.9, tone=2.4), a, 1.0)
    else:   # syncopes : temps 1, « et » du 2, temps 4 (pattern pop)
        for off, d, v in ((0.0, 0.45, 1.0), (0.75, 0.4, 0.75), (1.5, 0.45, 0.85)):
            if a + off < min(b, BREAK):
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
cut = lambda s: 1400 if s < LIFT else (2600 if s < FINAL else 3600 * np.exp(-(s - FINAL) / 1.6) + 900)
pad = np.stack([S.sweep(pad_b.x[:, c], cut, 'low') for c in range(2)], 1)
tsec = tt(N)
pad_gain = np.interp(tsec, [0, INTRO, LIFT - 0.01, LIFT, BREAK, FINAL, DUR], [0, 0.45, 0.45, 0.8, 0.8, 1.0, 0.6])
pad *= (pad_gain * np.where(tsec < BREAK, sc, 1.0))[:, None] * 0.55

# ---------------------------------------------------------------- arpèges
for k, t in enumerate(np.arange(8.0, BREAK, 0.125)):
    m = ARP[chord_at(t + 1e-3)[2]][k % 8]
    arp_b.add(S.pluck(m, bright=3800), t, (0.42 if k % 2 == 0 else 0.28) * (1.15 if t >= LIFT else 1.0), pan=(-0.35 if k % 2 else 0.35))
for k, t in enumerate(np.arange(FINAL + 0.5, 29.0, 0.25)):
    m = [84, 81, 77, 76, 72, 77, 81, 84][k % 8]
    arp_b.add(S.pluck(m, 0.3, bright=3000), t, 0.3 * (1 - (t - FINAL) / 4), pan=(-0.5 if k % 2 else 0.5))
arp = arp_b.x + S.pingpong(arp_b.x.mean(axis=1)) * 0.5
arp *= np.where(tsec < BREAK, 0.6 + 0.4 * sc, 1.0)[:, None]

# ---------------------------------------------------------------- montées
fx.add(S.riser(1.0, tone=(60, 72)), INTRO - 1.0, 0.16)

# ---------------------------------------------------------------- effets sur repères
def blip_for(c):
    return S.blip(700 * 2 ** (round((c['t'] - 16.32) / 0.07) * 2 / 12))


SFX = {
    'type': (lambda c: S.click(3000 + S.rng.random() * 1500), 0.12, 0.03),
    'pop': (lambda c: S.pop(), 0.3, 0.12),
    'click': (lambda c: S.click(2400, 0.006), 0.32, 0.06),
    'whoosh': (lambda c: S.whoosh(0.5), 0.26, 0.12),
    'swoosh': (lambda c: S.whoosh(0.38, 500, 3600), 0.22, 0.1),
    'gold': (lambda c: S.sparkle((2793.8, 3520.0, 4186.0, 5587.6)), 0.3, 0.4),         # fa-la-do-fa
    'notif': (lambda c: S.chime((1174.66, 1760.0)), 0.36, 0.3),                       # ré-la (Dm)
    'tick': (lambda c: S.tick(), 0.26, 0.1),
    'scribble': (lambda c: S.scribble(), 0.5, 0.05),
    'stamp': (lambda c: S.stamp(), 0.55, 0.15),
    'riser_short': (lambda c: S.riser(0.5, tone=(62, 74)), 0.28, 0.2),
    'hit': (lambda c: S.stab([62, 65, 69, 72, 76], 1.4) * 0.8 + np.pad(S.impact(), (0, ns(1.4) - ns(0.9))) * 0.5, 0.5, 0.35),
    'blip': (blip_for, 0.16, 0.15),
    'zip': (lambda c: S.zip_(), 0.2, 0.1),
    'counter': (lambda c: S.counter_ticks(18, 1.0), 0.32, 0.05),
    'logo': (lambda c: S.sparkle((1396.9, 1760.0, 2093.0, 2793.8), 0.05, 0.7), 0.34, 0.5),   # fa majeur
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
        print(f'{name:10s}', ' '.join(f'{S.rms_db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 4), (4, 16), (16, 26), (26, 30))))

mix = S.master(music + fx.x * 1.3 + wet, fade_out=1.2, drive=1.25)
print(S.write(COMP, mix), f'{DUR:.2f} s')
