#!/usr/bin/env python3
"""
Bande-son de « Realty — le logiciel immobilier tout-en-un » (72 s) — 100 % synthétisée.

  python3 scripts/score_realty.py   → build/realty/audio.wav

Pop « produit » lumineuse, comme les films de présentation de logiciels : 120 BPM, ré majeur.
  0–4 s    tic-tac et piano retenu (si m7 → sol) sous « dix outils à jongler », montée,
           souffle inversé quand les fenêtres sont aspirées
  4 s      DROP sur le logo : crash, boum, scintillement ; groove léger (kick 1-3, clap 2-4)
  12–48 s  les 6 domaines : groove complet (kick sur les temps, basse en croches, arpèges) ;
           ré – la/do# – si m7 – sol maj7, une mesure par accord
  48 s     relance sur le site web (crash, charleston ouverte), 56 s application mobile
  62–64 s  montée sur « +100 modules, +50 contrats… » (roulement, filtre qui s'ouvre)
  64 s     impact sur « 99 € HT/mois »
  66 s     accord final de ré majeur 9 sous « Realty fait le reste ! », qui résonne jusqu'à 72 s
Chaque fonctionnalité cochée joue une note de la gamme pentatonique de ré, de plus en plus haute.
Les effets d'interface sont posés sur les repères exportés par la timeline (build/realty/cues.json).
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S  # noqa: E402

COMP = 'realty'
DUR, CUES = S.load_cues(COMP)
S.setup(DUR, seed=23)
N, ns, tt = S.N, S.ns, S.tt

DROP, FULL, SITE, MOBILE, BUILD, PRICE, FINAL = 4.0, 12.0, 48.0, 56.0, 62.0, 64.0, 66.0
D, A_, BM, G = (50, [62, 64, 66, 69]), (49, [61, 64, 69, 71]), (47, [62, 66, 69, 71]), (43, [62, 66, 67, 71])
LOOP = [D, A_, BM, G]


def chord_at(t):
    """(basse, voicing) joués à l'instant t."""
    if t < 2.0:
        return BM
    if t < DROP:
        return G
    if BUILD <= t < BUILD + 1.0:
        return (40, [62, 64, 67, 71])          # mi m7
    if BUILD + 1.0 <= t < PRICE:
        return (45, [61, 64, 67, 69])          # la 7
    if t >= FINAL:
        return (50, [62, 64, 66, 69, 73])      # ré maj9
    if PRICE <= t < PRICE + 1.0:
        return D
    if PRICE + 1.0 <= t < FINAL:
        return A_
    return LOOP[int((t - DROP) // 2) % 4]


ARP = {50: [69, 74, 78, 81, 78, 74, 76, 74], 49: [69, 73, 76, 81, 76, 73, 71, 73], 47: [71, 74, 78, 83, 78, 74, 73, 74],
       43: [71, 74, 79, 83, 79, 74, 78, 74], 40: [67, 71, 74, 79, 74, 71, 69, 71], 45: [69, 73, 76, 79, 76, 73, 71, 73]}
drums, bass, keys_b, pad_b, arp_b, fx, send = (S.Bus() for _ in range(7))
tsec = tt(N)

# ---------------------------------------------------------------- batterie
groove_end = FINAL
kicks = list(np.arange(DROP, FULL, 1.0)) + [t for t in np.arange(FULL, BUILD, 0.5)] + list(np.arange(PRICE, FINAL, 0.5)) + [FINAL]
for t in kicks:
    drums.add(S.kick(decay=0.16), t, 0.95 if t == FINAL else 0.8)
for t in np.arange(BUILD, PRICE - 0.01, 1.0):            # montée : kick sur les temps forts seulement
    drums.add(S.kick(decay=0.12), t, 0.55)
for t in list(np.arange(DROP + 0.5, BUILD, 1.0)) + list(np.arange(PRICE + 0.5, FINAL, 1.0)):
    c = S.clap()
    drums.add(c, t, 0.3, pan=0.05)
    send.add(c, t, 0.12)
for k, t in enumerate(np.arange(DROP, BUILD, 0.25)):
    drums.add(S.hat(), t, (0.26 if k % 2 else 0.14) * (0.7 if t < FULL else 1.0), pan=0.25)
for t in list(np.arange(SITE + 0.25, BUILD, 0.5)) + list(np.arange(PRICE + 0.25, FINAL, 0.5)):
    drums.add(S.hat(True), t, 0.11, pan=-0.2)
for k, t in enumerate(np.arange(FULL, BUILD, 0.125)):     # shaker
    drums.add(S.shaker(), t, 0.13 if k % 2 else 0.06, pan=-0.35)
for k, t in enumerate(np.arange(0.0, DROP - 0.3, 0.5)):    # tic-tac de l'ouverture
    drums.add(S.rim(), t, 0.16 if k % 2 == 0 else 0.1, pan=(0.3 if k % 2 else -0.3))
for lo, hi, g in ((FULL - 0.5, FULL, 0.24), (SITE - 1.0, SITE, 0.26), (BUILD, PRICE, 0.3), (FINAL - 0.5, FINAL, 0.22)):
    steps = np.arange(lo, hi - 0.01, 0.125 if hi - lo > 1.5 else 0.0625)
    for k, t in enumerate(steps):
        drums.add(S.snare(0.2 + 0.8 * (k / len(steps)) ** 1.6), t, g)
for t, g in ((DROP, 0.34), (FULL, 0.3), (SITE, 0.38), (MOBILE, 0.26), (PRICE, 0.45), (FINAL, 0.5)):
    drums.add(S.crash(3.0 if t == FINAL else 2.4), t, g)

sc = S.sidechain(kicks, depth=0.5)
groove = (tsec >= DROP) & (tsec < FINAL)

# ---------------------------------------------------------------- basse en croches (rebond d'octave)
for k, t in enumerate(np.arange(DROP, FINAL, 0.25)):
    if BUILD <= t < PRICE and k % 2:
        continue
    root = chord_at(t + 1e-3)[0]
    m = root - 12 + (12 if k % 4 == 2 else 0)
    n = ns(0.23)
    x = S.lp(S.saw(S.mtof(m), n), 850) * 0.8 + S.sine(S.mtof(m) / 2, n) * 0.3
    env = np.exp(-tt(n) / 0.17) * np.minimum(1, tt(n) / 0.004)
    bass.add(S.fades(x * env, 0.002, 0.02), t, 0.4 if t >= FULL else 0.3)
n = ns(DUR - FINAL)
bass.add(S.fades(S.sine(S.mtof(38), n) * 0.55 * np.exp(-tt(n) / 1.8), 0.01, 0.4), FINAL, 0.4)

# ---------------------------------------------------------------- piano électrique
for bar in np.arange(0.0, DUR, 2.0):
    root, notes = chord_at(bar + 1e-3)
    if bar < DROP:
        keys_b.add(S.keys(notes, 1.9, 0.5, tone=1.3), bar, 1.0)
    elif bar >= FINAL:
        if bar == FINAL:
            keys_b.add(S.keys(notes, DUR - FINAL - 0.5, 0.95, tone=2.4), bar, 1.0)
    elif BUILD <= bar < PRICE:
        for off in (0.0, 0.5, 1.0, 1.5):              # croches répétées pendant la montée
            r2, n2 = chord_at(bar + off + 1e-3)
            keys_b.add(S.keys(n2, 0.3, 0.6 + 0.2 * off), bar + off, 0.8, pan=0.1)
    else:   # syncopes pop : 1, « et » du 2, 4
        for off, d, v in ((0.0, 0.45, 1.0), (0.75, 0.4, 0.75), (1.5, 0.45, 0.85)):
            r2, n2 = chord_at(bar + off + 1e-3)
            keys_b.add(S.keys(n2, d, v), bar + off, 0.8, pan=0.1)

# ---------------------------------------------------------------- nappe (supersaw doux)
for bar in np.arange(DROP, DUR, 1.0):
    root, notes = chord_at(bar + 1e-3)
    if bar > FINAL:
        continue
    length = (DUR - FINAL) if bar == FINAL else 1.0
    n = ns(length + 0.3)
    t = tt(n)
    L = sum(S.supersaw(m, n) for m in notes) / len(notes)
    R = sum(S.supersaw(m, n) for m in notes) / len(notes)
    env = np.minimum(1, t / 0.05) * np.clip((length + 0.3 - t) / 0.3, 0, 1)
    pad_b.add(np.stack([L * env, R * env], 1), bar, 1.0)
cut = lambda s: (1300 if s < FULL else 1900 if s < SITE else 2500 if s < BUILD else 900 + 3000 * ((s - BUILD) / 2) ** 2 if s < PRICE else 3200 if s < FINAL else 3600 * np.exp(-(s - FINAL) / 1.8) + 900)
pad = np.stack([S.sweep(pad_b.x[:, c], cut, 'low') for c in range(2)], 1)
pad_gain = np.interp(tsec, [0, DROP, FULL - 0.01, FULL, SITE, BUILD, PRICE, FINAL, DUR], [0, 0.4, 0.4, 0.5, 0.65, 0.75, 0.85, 1.0, 0.7])
pad *= (pad_gain * np.where(groove, sc, 1.0))[:, None] * 0.5

# ---------------------------------------------------------------- arpèges
for k, t in enumerate(np.arange(FULL, BUILD, 0.125)):
    m = ARP[chord_at(t + 1e-3)[0]][k % 8]
    arp_b.add(S.pluck(m, bright=3600), t, (0.36 if k % 2 == 0 else 0.22) * (1.15 if t >= SITE else 1.0), pan=(-0.35 if k % 2 else 0.35))
for k, t in enumerate(np.arange(BUILD, PRICE, 0.125)):
    m = ARP[chord_at(t + 1e-3)[0]][k % 8] + (12 if t >= BUILD + 1.0 else 0)
    arp_b.add(S.pluck(m, bright=2000 + 3000 * (t - BUILD) / 2), t, 0.3, pan=(-0.35 if k % 2 else 0.35))
for k, t in enumerate(np.arange(FINAL + 0.5, DUR - 1.2, 0.25)):
    m = [86, 81, 78, 76, 74, 78, 81, 85][k % 8]
    arp_b.add(S.pluck(m, 0.3, bright=3000), t, 0.3 * (1 - (t - FINAL) / 6), pan=(-0.5 if k % 2 else 0.5))
arp = arp_b.x + S.pingpong(arp_b.x.mean(axis=1)) * 0.5
arp *= np.where(groove, 0.6 + 0.4 * sc, 1.0)[:, None]

# ---------------------------------------------------------------- montées et boums
fx.add(S.riser(1.6, tone=(57, 69)), DROP - 1.6, 0.18)
fx.add(S.sub_drop(1.6, 180, 42), DROP, 0.45)
fx.add(S.riser(1.0, tone=(62, 74)), SITE - 1.0, 0.14)
fx.add(S.riser(2.0, tone=(57, 81)), PRICE - 2.0, 0.2)
fx.add(S.rev_cymbal(0.9), PRICE - 0.9, 0.24)
fx.add(S.sub_drop(1.8, 200, 38), PRICE, 0.5)
fx.add(S.rev_cymbal(0.6), FINAL - 0.6, 0.2)

# ---------------------------------------------------------------- effets sur repères
PENTA = [74, 76, 78, 81, 83, 86, 88, 90]      # ré pentatonique, du ré5 au fa#6


def check(c):
    """Fonctionnalité cochée : cloche sur la pentatonique, de plus en plus haute, + petit pop."""
    m = PENTA[min(int(c.get('n', 0)), len(PENTA) - 1)]
    n = ns(0.9)
    x = S.bell(float(S.mtof(m)), n, 0.42) * 0.55
    p = S.pop(500, 1100, 0.08)
    x[: len(p)] += p * 0.5
    return x


BLIP = {}


def blip(c):
    k = BLIP.setdefault(round(c['t'] // 6), [0])
    k[0] += 1
    return S.blip(float(S.mtof(PENTA[(k[0] - 1) % 5] - 12)))


def sparkle_on_chord(c):
    notes = sorted(set(m % 12 for m in chord_at(c['t'])[1]))
    return S.sparkle(tuple(float(S.mtof(96 + n)) for n in notes[:4]))


def hit(c):
    notes = [m + 12 for m in chord_at(c['t'] + 1e-3)[1]]
    return S.stab(notes, 1.4, 0.35) * 0.7 + np.pad(S.impact(), (0, ns(1.4) - ns(0.9))) * 0.55


SFX = {
    'type': (lambda c: S.click(3000 + S.rng.random() * 1500), 0.1, 0.03),
    'pop': (lambda c: S.pop(), 0.28, 0.12),
    'click': (lambda c: S.click(2400, 0.006) + np.pad(S.pop(900, 1400, 0.03), (0, ns(0.04) - ns(0.03))) * 0.4, 0.36, 0.06),
    'check': (check, 0.26, 0.3),
    'tick': (lambda c: S.tick(), 0.22, 0.1),
    'blip': (blip, 0.16, 0.15),
    'whoosh': (lambda c: S.whoosh(0.55, 280, 2800, rumble=0.25), 0.26, 0.12),
    'swoosh': (lambda c: S.whoosh(0.38, 500, 3600), 0.2, 0.1),
    'swipe': (lambda c: S.whoosh(0.32, 900, 4200), 0.18, 0.08),
    'suck': (lambda c: S.whoosh(0.6, 300, 3200, rev=True, pan=(0.5, -0.5)), 0.3, 0.12),
    'gold': (sparkle_on_chord, 0.28, 0.4),
    'notif': (lambda c: S.chime((1174.66, 1760.0)), 0.34, 0.3),               # ré – la
    'success': (lambda c: S.chime((1174.66, 1479.98, 1760.0), 0.06), 0.3, 0.3),
    'counter': (lambda c: S.counter_ticks(18, 1.0), 0.28, 0.05),
    'bars': (lambda c: S.counter_ticks(12, 0.65), 0.2, 0.05),
    'zip': (lambda c: S.zip_(), 0.2, 0.1),
    'scribble': (lambda c: S.scribble(0.7), 0.45, 0.05),
    'stamp': (lambda c: S.stamp(), 0.5, 0.15),
    'hit': (hit, 0.48, 0.35),
    'logo': (lambda c: S.sparkle((1174.66, 1479.98, 1760.0, 2349.32), 0.05, 0.8), 0.36, 0.5),   # ré majeur
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

intro = np.interp(tsec, [0, 0.3, DROP], [0.0, 0.8, 1.0])   # attaque douce du piano d'ouverture
music = (drums.x * 0.5 + bass.x * (sc[:, None] * 0.85 + 0.15) + keys_b.x * 0.55 * intro[:, None] + pad + arp * 0.85)

if os.environ.get('STEMS'):
    for name, x in (('batterie', drums.x * 0.5), ('basse', bass.x), ('piano', keys_b.x * 0.55), ('nappe', pad), ('arpèges', arp * 0.85), ('effets', fx.x), ('réverb', wet)):
        print(f'{name:10s}', ' '.join(f'{S.rms_db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 4), (4, 12), (12, 48), (48, 62), (62, 66), (66, 72))))

S.mix_voice(COMP, music, fx.x, wet, fade_out=1.5, drive=1.25)
