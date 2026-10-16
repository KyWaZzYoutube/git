#!/usr/bin/env python3
"""
Bande-son de la bande démo Realty (114 s) — 100 % synthétisée, sans échantillon.

  python3 scripts/score_realty.py   → build/realty/audio.wav

Électro « corporate » lumineuse à 120 BPM, en la mineur / do majeur (la m – fa – do – sol) :
  0–3,7      dix outils : nappe, pulsation étouffée et montée → flash
  3,7–8      logo : boum de sub, cloche, arpège discret qui s'installe
  8–33       l'application apparaît : kick, basse en contretemps, charleston ; claps dès 16 s
  33–56,5    IA, estimation, mandat, valorisation : arpège plus brillant, stabs
  56,5–60    « Démarrer la commercialisation » : le clic relance tout (impact, crash)
  60–62      pause café : la batterie s'arrête, piano électrique seul, puis relance
  62–107     vente, site, compromis, automatisations (charleston ouverte dès 91,5 s)
  107,95     fin : impact, accord de do majeur 9 tenu, cloche, fondu
Les bruitages (transitions, clics, notifications, signature, tampon…) sont posés sur les
repères exportés par la timeline (build/realty/cues.json).
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S  # noqa: E402

COMP = 'realty'
DUR, CUES = S.load_cues(COMP)
S.setup(DUR, seed=2026)
N, ns, tt = S.N, S.ns, S.tt
tsec = tt(N)

G0 = 0.0                        # grille à 120 BPM : le groove démarre quand l'application apparaît (8 s)
DROP, CLAPS, LIFT2, LAUNCH = 8.0, 16.0, 33.0, 56.5
CAFE, CAFE_END = 60.0, 62.0
AUTO, BREAK, FINAL = 91.5, 107.0, 107.95
OUTRO_END = FINAL + 4.0

PROG = [(45, [57, 60, 64, 69]),   # la m
        (41, [57, 60, 65, 69]),   # fa
        (48, [55, 60, 64, 67]),   # do
        (43, [55, 59, 62, 67])]   # sol
CAFE_CH = (41, [57, 60, 64, 65, 69])      # fa maj7 pendant la pause café
FINAL_CH = (48, [60, 64, 67, 71, 74])     # do maj9 final
ARP = {45: [69, 72, 76, 81, 76, 72, 69, 72], 41: [69, 72, 77, 81, 77, 72, 69, 72],
       48: [67, 72, 76, 79, 76, 72, 67, 72], 43: [67, 71, 74, 79, 74, 71, 67, 71]}


def bar_of(t):
    return int(np.floor((t - G0) / 2.0))


def chord_at(t):
    if t >= FINAL:
        return FINAL_CH
    if CAFE <= t < CAFE_END:
        return CAFE_CH
    return PROG[bar_of(t) % 4] if t >= G0 else PROG[0]


def grid(a, b, step):
    """Temps de la grille (décalée de G0) compris dans [a, b[."""
    k0 = int(np.ceil((a - G0) / step - 1e-9))
    out = []
    t = G0 + k0 * step
    while t < b - 1e-9:
        out.append(round(t, 4))
        t += step
    return out


def in_groove(t):
    return (DROP <= t < CAFE) or (CAFE_END <= t < BREAK)


drums, bass, pad_b, arp_b, stabs_b, keys_b, fx, send = (S.Bus() for _ in range(8))

# ---------------------------------------------------------------- batterie
kicks = [t for t in grid(DROP, BREAK, 0.5) if in_groove(t)] + grid(FINAL + 0.45, OUTRO_END, 1.0)
for t in kicks:
    root = chord_at(t + 1e-3)[0] - 12
    drums.add(S.kick808(root, tail=0.26, punch=1.7), t, 0.85 if t < FINAL else 0.55)
for t in grid(CLAPS + 0.5, BREAK, 1.0):              # clap sur 2 et 4
    if in_groove(t):
        c = S.clap()
        drums.add(c, t, 0.3, pan=0.05)
        send.add(c, t, 0.12)
for t in grid(DROP, BREAK, 0.5):                     # charleston en contretemps
    if in_groove(t + 0.25):
        drums.add(S.tick_hat(), t + 0.25, 0.22 if t >= LIFT2 else 0.17, pan=0.22)
for k, t in enumerate(grid(LIFT2, BREAK, 0.125)):    # doubles-croches discrètes à partir de l'IA
    if in_groove(t) and k % 4 != 2:
        drums.add(S.tick_hat(0.6), t, 0.05 + 0.03 * (k % 2), pan=-0.3)
for t in grid(CAFE_END, BREAK, 0.5):                 # charleston ouverte sur la partie « vente »
    if in_groove(t + 0.25) and AUTO <= t:
        drums.add(S.hat(True), t + 0.25, 0.09, pan=-0.15)
for bar in grid(DROP, BREAK, 2.0):                   # petites percussions syncopées
    for off in (0.75, 1.25, 1.75):
        t = bar + off
        if in_groove(t) and t >= CLAPS:
            drums.add(S.rim(), t, 0.09, pan=(0.45 if off % 1 else -0.45))
for t in grid(0.75, DROP - 0.1, 0.5):                # intro : pulsation étouffée qui monte
    p = (t - 0.75) / (DROP - 0.75)
    drums.add(S.lp(S.kick808(33, tail=0.2), 200), t, 0.1 + 0.35 * p ** 1.5)
for lo, hi in ((LAUNCH - 1.0, LAUNCH), (CAFE_END - 1.0, CAFE_END), (AUTO - 1.0, AUTO)):   # roulements
    steps = grid(lo, hi, 0.0625)
    for k, t in enumerate(steps):
        drums.add(S.snare(0.2 + 0.8 * (k / len(steps)) ** 1.6), t, 0.2)
for t, g in ((DROP, 0.34), (LIFT2, 0.3), (LAUNCH, 0.4), (CAFE_END, 0.4), (AUTO, 0.34), (FINAL, 0.5)):
    drums.add(S.crash(3.0), t, g)

sc = S.sidechain(kicks, depth=0.62, tau=0.1)
groove = np.zeros(N, bool)
for a, b in ((DROP, CAFE), (CAFE_END, BREAK), (FINAL, OUTRO_END + 0.5)):
    groove |= (tsec >= a) & (tsec < b)

# ---------------------------------------------------------------- basse en contretemps, sub final
for k, t in enumerate(grid(DROP, BREAK, 0.5)):
    tb = t + 0.25
    if in_groove(tb):
        root = chord_at(tb)[0]
        bass.add(S.offbass(root - 12 + (12 if k % 4 == 3 else 0) + 12), tb, 0.3)
for t in grid(FINAL + 0.45, OUTRO_END, 0.5):
    bass.add(S.offbass(48), t + 0.25, 0.16)
n = ns(2.6)
bass.add(S.fades(np.tanh(1.5 * S.sine(S.mtof(36), n)) * np.clip((2.6 - tt(n)) / 1.2, 0, 1), 0.005, 0.1), FINAL, 0.38)

# ---------------------------------------------------------------- nappe (pompe avec le kick)
segs = [(0.0, DROP, PROG[0])]
for bt in grid(DROP, CAFE, 2.0):
    segs.append((bt, min(bt + 2.0, CAFE), PROG[bar_of(bt + 1e-3) % 4]))
segs.append((CAFE, CAFE_END, CAFE_CH))
for bt in grid(CAFE_END, BREAK, 2.0):
    segs.append((bt, min(bt + 2.0, BREAK), PROG[bar_of(bt + 1e-3) % 4]))
segs.append((FINAL, DUR, FINAL_CH))
for (a, b, (root, notes)) in segs:
    if b - a < 0.05:
        continue
    n = ns(b - a + 0.4)
    t = tt(n)
    L = sum(S.supersaw(m, n, 5, 0.12) for m in notes) / len(notes)
    R = sum(S.supersaw(m, n, 5, 0.12) for m in notes) / len(notes)
    att = 2.5 if a == 0 else (0.6 if a in (CAFE, FINAL) else 0.04)
    env = np.minimum(1, t / att) * np.clip((b - a + 0.4 - t) / 0.4, 0, 1)
    pad_b.add(np.stack([L * env, R * env], 1), a, 1.0)


def cutoff(s):
    if s < DROP:
        return 400 + 1400 * (s / DROP) ** 2
    if s < LIFT2:
        return 1300
    if s < CAFE:
        return 2000
    if s < CAFE_END:
        return 900 + 1600 * max(0, (s - (CAFE_END - 1.5)) / 1.5) ** 2
    if s < FINAL:
        return 2300
    return 3800 * np.exp(-(s - FINAL) / 2.0) + 900


pad = np.stack([S.sweep(pad_b.x[:, c], cutoff, 'low') for c in range(2)], 1)
pad_gain = np.interp(tsec, [0, 3.0, DROP - 0.01, DROP, CAFE - 0.01, CAFE, CAFE_END - 0.01, CAFE_END, BREAK, FINAL, DUR],
                     [0.0, 0.9, 1.1, 0.45, 0.5, 1.0, 1.1, 0.5, 0.5, 1.0, 0.7])
pad *= (pad_gain * np.where(groove, sc, 1.0))[:, None] * 0.42

# ---------------------------------------------------------------- arpège (pluck) avec écho ping-pong
for k, t in enumerate(grid(4.0, BREAK, 0.25)):
    if t < DROP:
        g = 0.08 + 0.12 * (t - 4.0) / 4.0
    elif not in_groove(t) or t < DROP + 4.0:
        continue
    else:
        g = 0.2 if t < LIFT2 else 0.27
    m = ARP[chord_at(t + 1e-3)[0]][k % 8] + (12 if (t >= LIFT2 and k % 8 == 3) else 0)
    arp_b.add(S.pluck(m, 0.2, bright=2200 if t < LIFT2 else 3200), t, g * (1.15 if k % 2 == 0 else 0.8), pan=(-0.4 if k % 2 else 0.4))
for k, t in enumerate(grid(FINAL + 0.95, DUR - 1.5, 0.25)):
    m = [84, 79, 76, 72, 76, 79, 83, 86][k % 8]
    arp_b.add(S.pluck(m, 0.3, bright=2800), t, 0.2 * (1 - (t - FINAL) / 6.5), pan=(-0.5 if k % 2 else 0.5))
arp = arp_b.x + S.pingpong(arp_b.x.mean(axis=1)) * 0.5
arp *= np.where(groove, 0.55 + 0.45 * sc, 1.0)[:, None]

# ---------------------------------------------------------------- stabs (parties IA → valorisation, puis automatisations)
for t in grid(LIFT2, CAFE, 0.5):
    if (t - G0) % 2.0 in (0.5, 1.5) or (LAUNCH <= t < CAFE and (t - G0) % 1.0 == 0.5):
        stabs_b.add(S.house_stab([m + 12 for m in chord_at(t)[1]]), t + 0.25, 0.7)
for t in grid(AUTO, BREAK, 0.5):
    if (t - G0) % 1.0 == 0.5:
        stabs_b.add(S.house_stab([m + 12 for m in chord_at(t)[1]]), t + 0.25, 0.75)

# ---------------------------------------------------------------- piano électrique de la pause café
for k, (t, notes) in enumerate([(CAFE + 0.45, [65, 69, 72, 76]), (CAFE + 1.0, [64, 67, 72, 76]), (CAFE + 1.5, [62, 65, 69, 72])]):
    keys_b.add(S.keys(notes, 0.9, 0.8, 1.6), t, 0.5, pan=(-0.2 + 0.2 * k))
for t, notes in ((FINAL + 0.02, [60, 64, 67, 71, 74]),):
    keys_b.add(S.keys(notes, 3.5, 0.9, 1.4), t, 0.4)

# ---------------------------------------------------------------- montées, boums
fx.add(S.riser(3.0, tone=(50, 64)), 0.7, 0.14)               # montée sous les dix outils, jusqu'au flash
fx.add(S.sub_drop(1.8, 180, 40), 3.7, 0.45)                # le logo apparaît
fx.add(S.riser(2.4, tone=(52, 69)), DROP - 2.4, 0.16)
fx.add(S.rev_cymbal(1.2), DROP - 1.2, 0.3)
fx.add(S.sub_drop(2.0, 190, 38), DROP, 0.55)
fx.add(S.rev_cymbal(0.9), LIFT2 - 0.9, 0.22)
fx.add(S.riser(1.8, tone=(55, 72)), CAFE_END - 1.8, 0.2)
fx.add(S.rev_cymbal(1.0), CAFE_END - 1.0, 0.26)
fx.add(S.sub_drop(1.6, 170, 42), CAFE_END, 0.45)
fx.add(S.rev_cymbal(0.9), AUTO - 0.9, 0.22)
fx.add(S.riser(1.0, tone=(57, 69)), BREAK - 0.7, 0.18)
fx.add(S.sub_drop(2.4, 200, 34), FINAL, 0.6)


# ---------------------------------------------------------------- effets posés sur les repères
def nth(ctype):
    times = sorted(c['t'] for c in CUES if c['type'] == ctype)
    return lambda c: times.index(c['t'])


def top_notes(t, base=84, count=2):
    notes = sorted(set(m % 12 for m in chord_at(t)[1]))
    return [float(S.mtof(base + m)) for m in notes][-count:]


def notif(c):
    return S.chime(tuple(top_notes(c['t'], 84, 2)))


def sparkle_chord(c):
    return S.sparkle(tuple(top_notes(c['t'], 96, 4)))


def hit(c):
    notes = [m + 12 for m in chord_at(c['t'] + 1e-3)[1]]
    return S.stab(notes, 1.2, 0.3) * 0.55 + np.pad(S.impact(), (0, ns(1.2) - ns(0.9))) * 0.6


def launch(c):
    n = ns(2.0)
    out = np.zeros(n)
    i = S.impact()
    out[:len(i)] += i * 0.9
    d = S.sub_drop(2.0, 210, 40)
    out[:len(d)] += d * 0.8
    st = S.stab([m + 12 for m in chord_at(c['t'] + 0.3)[1]], 1.4, 0.35)
    out[:len(st)] += st * 0.5
    return out


def final(c):
    n = ns(3.2)
    out = np.zeros(n)
    i = S.impact()
    out[:len(i)] += i
    b = S.bell([523.25, 659.25, 783.99, 987.77], n, 1.4) * 0.22
    out += b
    return out


def typeburst(c):
    n = ns(0.75)
    out = np.zeros(n)
    for k in range(11):
        d = ns(k * 0.062 + S.rng.random() * 0.012)
        k_ = S.click(2800 + S.rng.random() * 1600, 0.003)
        out[d:d + len(k_)] += k_[: n - d] * (0.6 + 0.4 * S.rng.random())
    return out


def paper(c):
    n = ns(0.35)
    t = tt(n)
    env = np.sin(np.pi * t / 0.35) ** 1.5 * (0.6 + 0.4 * np.sin(t * 90))
    return S.bp(S.rng.standard_normal(n), 1800, 7000) * env * 0.6


def scan(c):
    n = ns(0.9)
    t = tt(n)
    x = S.sweep(S.rng.standard_normal(n), lambda s: (600 + 5000 * (s / 0.9) ** 1.4, 1400 + 9000 * (s / 0.9) ** 1.4), 'band')
    tone = S.sine(900 + 1500 * t / 0.9, n) * 0.12
    return S.fades((x * 0.5 + tone) * np.sin(np.pi * t / 0.9) ** 1.2, 0.01, 0.05)


def scanlite(c):
    return S.zip_() * 0.8


def drop_(c):
    p = S.pop(260, 110, 0.12)
    n = ns(0.25)
    t = tt(n)
    thud = S.lp(S.rng.standard_normal(n), 400) * np.exp(-t / 0.03) * 0.5
    thud[:len(p)] += p
    return thud


blip_k = nth('blip')


def blip(c):
    scale = [69, 72, 74, 76, 79, 81, 84]
    return S.blip(float(S.mtof(scale[blip_k(c) % len(scale)] + 12)))


tick_notes = {}


def tick(c):
    return S.tick()


def alert(c):
    n = ns(0.6)
    out = np.zeros(n)
    for f, t0 in ((880.0, 0.0), (698.46, 0.14)):
        m = ns(0.22)
        t = tt(m)
        x = S.lp(np.sign(S.sine(f, m)) * 0.35 + S.sine(f, m) * 0.65, 2400) * np.exp(-t / 0.08) * np.minimum(1, t / 0.003)
        i = ns(t0)
        out[i:i + m] += x[: n - i]
    return out


def voice(c):
    n = ns(1.9)
    t = tt(n)
    f = [float(S.mtof(m)) for m in (69, 76, 81)]
    x = sum(S.sine(fr * (1 + 0.003 * np.sin(t * 6 + k)), n) for k, fr in enumerate(f)) / 3
    env = np.minimum(1, t / 0.3) * np.clip((1.9 - t) / 0.5, 0, 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t) ** 2)
    return x * env * 0.5


def cafe(c):
    n = ns(1.6)
    return S.bell([659.25, 783.99], n, 0.9, ((1, 1), (2, 0.2), (3, 0.05))) * 0.4


def draw(c):
    w = S.whoosh(1.2, 500, 3200).mean(axis=1)
    return w * 0.7


SFX = {
    'title': (lambda c: S.whoosh(0.34, 700, 3600), 0.11, 0.08),
    'swoosh': (lambda c: S.whoosh(0.4, 450, 3400), 0.2, 0.1),
    'swipe': (lambda c: S.whoosh(0.32, 900, 4400), 0.17, 0.08),
    'whoosh': (lambda c: S.whoosh(0.55, 250, 2400, rumble=0.3), 0.27, 0.12),
    'wipe': (lambda c: S.whoosh(1.0, 180, 2800, rumble=0.5), 0.34, 0.16),
    'iris': (lambda c: S.whoosh(0.75, 300, 3000, rumble=0.25, rev=True), 0.26, 0.12),
    'suck': (lambda c: S.whoosh(0.55, 300, 3600, rev=True), 0.24, 0.1),
    'pop': (lambda c: S.pop(420, 860, 0.09), 0.26, 0.12),
    'tick': (tick, 0.18, 0.08),
    'click': (lambda c: S.click(3400, 0.004), 0.32, 0.05),
    'type': (lambda c: S.click(3000 + S.rng.random() * 1500), 0.09, 0.02),
    'typeburst': (typeburst, 0.11, 0.02),
    'notif': (notif, 0.3, 0.3),
    'hit': (hit, 0.36, 0.3),
    'launch': (launch, 0.42, 0.35),
    'logo': (lambda c: S.sparkle((1046.5, 1318.51, 1567.98, 2093.0), 0.06, 0.9), 0.32, 0.5),
    'final': (final, 0.5, 0.5),
    'counter': (lambda c: S.counter_ticks(22, 1.4), 0.24, 0.05),
    'scribble': (lambda c: S.scribble(0.95), 0.32, 0.05),
    'stamp': (lambda c: S.stamp(), 0.5, 0.25),
    'scan': (scan, 0.26, 0.15),
    'scanlite': (scanlite, 0.18, 0.1),
    'drop': (drop_, 0.36, 0.1),
    'paper': (paper, 0.22, 0.06),
    'sparkle': (sparkle_chord, 0.26, 0.4),
    'alert': (alert, 0.24, 0.2),
    'riser': (lambda c: S.riser(1.0, tone=(57, 76)), 0.2, 0.15),
    'blip': (blip, 0.16, 0.25),
    'voice': (voice, 0.2, 0.3),
    'cafe': (cafe, 0.3, 0.45),
    'draw': (draw, 0.15, 0.1),
    'open': (lambda c: S.whoosh(0.85, 220, 3000, rumble=0.35), 0.26, 0.14),
    'close': (lambda c: S.whoosh(0.8, 300, 3200, rumble=0.2, rev=True), 0.22, 0.12),
    'badge': (lambda c: S.pop(760, 1500, 0.07), 0.12, 0.2),
    'morph': (lambda c: S.whoosh(0.6, 450, 3400), 0.2, 0.1),
    'flip': (lambda c: S.whoosh(0.3, 900, 4200), 0.22, 0.1),
    'sweep': (draw, 0.12, 0.1),
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
ir = S.make_ir(2.4, damp=4600)
send.x += pad * 0.22 + arp * 0.3 + stabs_b.x * 0.25 + keys_b.x * 0.5
wet = S.reverb(send.x, ir) * 0.5

gate = np.ones(N)
gate[(tsec >= BREAK) & (tsec < FINAL)] = 0.0     # silence juste avant l'impact final
gate = S.lp(gate, 60, 1)
stabs = stabs_b.x * sc[:, None]
music = drums.x * 0.6 + bass.x * (sc[:, None] * 0.8 + 0.2) + pad + arp * 0.7 + stabs * 0.7 + keys_b.x * 0.9
music *= gate[:, None]

if os.environ.get('STEMS'):
    for name, x in (('batterie', drums.x * 0.6), ('basse', bass.x), ('nappe', pad), ('arpège', arp * 0.7), ('stabs', stabs * 0.7), ('effets', fx.x), ('réverb', wet)):
        print(f'{name:10s}', ' '.join(f'{S.rms_db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 8), (8, 33), (33, 56), (60, 62), (62, 107), (108, 114))))

S.mix_voice(COMP, music, fx.x, wet, fade_out=1.6)
