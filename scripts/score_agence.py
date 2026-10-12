#!/usr/bin/env python3
"""
Bande-son de « Agence de publicité immobilière » (36 s) — 100 % synthétisée.

  python3 scripts/score_agence.py   → build/agence/audio.wav

Même style « tech-house sombre » que la vidéo Facebook (kick 808 accordé, boums de sub,
basse en contretemps, nappe qui pompe avec le kick), en sol mineur → si bémol majeur, 120 BPM.
  0–6 s    tension sous « pige, portails, flyers » : nappe sombre, tic-tac, pulsation étouffée
           qui monte → boum de sub à 6 s, quand l'écran devient orange
  6–22 s   groove : un accord par levier (sol m, si♭, fa, do m) ; claps dès 10 s, arpège dès 14 s
  22 s     relance sur les résultats (stabs, charleston ouverte) : sol m – fa, puis mi♭ – fa
  30 s     si bémol majeur : impact, sub tenu et cloche ; groove léger sous l'appel à l'action
Les effets d'interface sont posés sur les repères exportés par la timeline. Pas de voix off :
comme les vidéos Google Ads et Facebook, le film est porté par la musique et les bruitages.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S  # noqa: E402

COMP = 'agence'
DUR, CUES = S.load_cues(COMP)
S.setup(DUR, seed=47)
N, ns, tt = S.N, S.ns, S.tt

DROP, CLAPS, ARPS, LIFT, METHOD, BREAK, FINAL = 6.0, 10.0, 14.0, 22.0, 26.0, 29.75, 30.0
OUTRO = FINAL + 4.0      # le groove léger de la fin s'arrête deux mesures après l'impact

#            début  fin   basse (kick 808)  voicing (nappe / stabs)
CHORDS = [(0.0, 6.0, 43, [55, 62, 65, 69]),      # Gm(add9)  pige, portails, flyers
          (6.0, 10.0, 43, [55, 58, 62, 65]),     # Gm        les vendeurs vous contactent
          (10.0, 14.0, 46, [58, 62, 65, 70]),    # B♭        Google Ads
          (14.0, 18.0, 41, [57, 60, 65, 69]),    # F         Facebook et Instagram
          (18.0, 22.0, 48, [55, 60, 63, 67]),    # Cm        référencement naturel
          (22.0, 24.0, 43, [55, 58, 62, 65]),    # Gm        résultats
          (24.0, 26.0, 41, [57, 60, 65, 69]),    # F
          (26.0, 28.0, 39, [55, 58, 63, 67]),    # E♭        méthode
          (28.0, 30.0, 41, [57, 60, 65, 69]),    # F
          (30.0, DUR, 46, [58, 62, 65, 69, 72])]  # B♭maj9    votre secteur est-il encore disponible ?
ARP = {43: [67, 70, 74, 77, 74, 70, 69, 70], 46: [70, 74, 77, 82, 77, 74, 72, 74],
       41: [69, 72, 77, 81, 77, 72, 69, 72], 48: [67, 72, 75, 79, 75, 72, 70, 72],
       39: [67, 70, 75, 79, 75, 70, 67, 70]}


def chord_at(t):
    for c in CHORDS:
        if c[0] <= t < c[1]:
            return c
    return CHORDS[-1]


drums, bass, pad_b, arp_b, stabs_b, fx, send = (S.Bus() for _ in range(7))
tsec = tt(N)

# ---------------------------------------------------------------- batterie
kicks = list(np.arange(DROP, BREAK - 0.01, 0.5)) + list(np.arange(FINAL, OUTRO, 1.0))
for t in kicks:
    root = chord_at(t + 1e-3)[2] - 12          # traîne du kick accordée sur la basse de l'accord
    if t == FINAL:
        drums.add(S.kick808(root, tail=0.6), t, 1.0)
    else:
        drums.add(S.kick808(root), t, 0.95 if t < FINAL else 0.7)
for t in np.arange(CLAPS + 0.5, BREAK, 1.0):          # clap sur 2 et 4
    c = S.clap()
    drums.add(c, t, 0.32, pan=0.04)
    send.add(c, t, 0.14)
for t in np.arange(0.5, BREAK, 0.5):                  # charleston sur les contretemps (dès l'intro, très douce)
    drums.add(S.tick_hat(), t + 0.25, 0.1 if t < DROP else 0.24, pan=0.22)
for t in np.arange(FINAL, OUTRO, 0.5):
    drums.add(S.tick_hat(), t + 0.25, 0.16, pan=0.22)
for k, t in enumerate(np.arange(DROP, BREAK, 0.125)):  # doubles-croches très discrètes
    if k % 4 == 2:
        continue
    drums.add(S.tick_hat(0.6), t, 0.07 + 0.04 * (k % 2), pan=-0.3)
for t in np.arange(LIFT + 0.25, METHOD, 0.5):         # charleston ouverte sur la relance
    drums.add(S.hat(True), t, 0.12, pan=-0.15)
RIMS = [0.75, 1.75, 2.25, 3.5]                        # petites percussions syncopées, par mesure
for bar in np.arange(DROP, BREAK, 2.0):
    for off in RIMS:
        if bar + off < BREAK and not (bar < CLAPS and off == 3.5):
            drums.add(S.rim(), bar + off, 0.12, pan=(0.45 if off % 1 else -0.45))
for k, t in enumerate(np.arange(0.0, DROP - 0.2, 0.5)):  # tic-tac de l'intro
    drums.add(S.rim(), t, 0.05 if k % 2 else 0.08, pan=0.35)
for t in np.arange(2.0, DROP - 0.4, 0.5):             # pulsation étouffée qui monte vers le drop
    p = (t - 2.0) / (DROP - 2.4)
    drums.add(S.lp(S.kick808(31, tail=0.22), 180), t, 0.18 + 0.32 * p)
for lo, hi in ((LIFT - 1.0, LIFT), (BREAK - 1.0, BREAK)):   # roulements avant les relances
    steps = np.arange(lo, hi - 0.01, 0.0625)
    for k, t in enumerate(steps):
        drums.add(S.snare(0.2 + 0.8 * (k / len(steps)) ** 1.5), t, 0.24)
drums.add(S.crash(2.6), DROP, 0.3)
drums.add(S.crash(2.4), LIFT, 0.36)
drums.add(S.crash(3.6), FINAL, 0.5)

sc = S.sidechain(kicks, depth=0.7, tau=0.11)
groove = ((tsec >= DROP) & (tsec < BREAK)) | ((tsec >= FINAL) & (tsec < OUTRO + 0.5))

# ---------------------------------------------------------------- basse en contretemps, puis sub tenu final (si♭ grave)
for k, t in enumerate(np.arange(DROP + 0.25, BREAK, 0.5)):
    root = chord_at(t + 1e-3)[2]
    bass.add(S.offbass(root + (12 if k % 4 == 3 else 0)), t, 0.32)
for t in np.arange(FINAL + 0.25, OUTRO, 0.5):
    bass.add(S.offbass(46), t, 0.2)
n = ns(1.8)
bass.add(S.fades(np.tanh(1.6 * S.sine(S.mtof(34), n)) * np.minimum(1, tt(n) / 0.01) * np.clip((1.8 - tt(n)) / 0.6, 0, 1), 0.005, 0.1), FINAL, 0.4)

# ---------------------------------------------------------------- nappe sombre (pompe avec le kick)
for (a, b, root, notes) in CHORDS:
    n = ns(b - a + 0.5)
    t = tt(n)
    L = sum(S.supersaw(m, n, 5, 0.12) for m in notes) / len(notes)
    R = sum(S.supersaw(m, n, 5, 0.12) for m in notes) / len(notes)
    att = 1.2 if a == 0 else 0.06
    env = np.minimum(1, t / att) * np.clip((b - a + 0.5 - t) / 0.5, 0, 1)
    pad_b.add(np.stack([L * env, R * env], 1), a, 1.0)
cut = lambda s: (500 + 700 * s / DROP) if s < DROP else (950 if s < LIFT else (2000 if s < METHOD else (1500 if s < FINAL else 3000 * np.exp(-(s - FINAL) / 1.4) + 800)))
pad = np.stack([S.sweep(pad_b.x[:, c], cut, 'low') for c in range(2)], 1)
pad_gain = np.interp(tsec, [0, 2.0, DROP - 0.01, DROP, LIFT - 0.01, LIFT, METHOD, BREAK, FINAL, DUR],
                     [0.0, 1.0, 1.15, 0.5, 0.45, 0.6, 0.55, 0.55, 1.0, 0.6])
pad *= (pad_gain * np.where(groove, sc, 1.0))[:, None] * 0.5

# ---------------------------------------------------------------- arpège filtré (mouvement discret)
for k, t in enumerate(np.arange(ARPS, BREAK, 0.25)):
    m = ARP[chord_at(t + 1e-3)[2]][k % 8]
    arp_b.add(S.pluck(m, 0.2, bright=2400), t, (0.34 if k % 2 == 0 else 0.22) * (1.2 if t >= LIFT else 1.0), pan=(-0.4 if k % 2 else 0.4))
for k, t in enumerate(np.arange(FINAL + 0.5, DUR - 1.0, 0.25)):
    m = [89, 86, 82, 77, 82, 86, 89, 94][k % 8]
    arp_b.add(S.pluck(m, 0.3, bright=2800), t, 0.24 * (1 - (t - FINAL) / 6), pan=(-0.5 if k % 2 else 0.5))
arp = arp_b.x + S.pingpong(arp_b.x.mean(axis=1)) * 0.55
arp *= np.where(groove, 0.5 + 0.5 * sc, 1.0)[:, None]

# ---------------------------------------------------------------- stabs d'accords sur la relance (résultats)
for t in np.arange(LIFT, METHOD, 0.5):
    notes = chord_at(t + 0.25)[3]
    stabs_b.add(S.house_stab([m + 12 for m in notes]), t + 0.25, 1.1, pan=0.0)

# ---------------------------------------------------------------- montées, boums, cymbales inversées
fx.add(S.riser(1.6, tone=(55, 67)), DROP - 1.6, 0.2)
fx.add(S.rev_cymbal(1.0), DROP - 1.0, 0.3)
fx.add(S.sub_drop(), DROP, 0.55)
fx.add(S.rev_cymbal(0.8), LIFT - 0.8, 0.26)
fx.add(S.sub_drop(1.4, 170, 44), LIFT, 0.4)
fx.add(S.riser(1.2, tone=(53, 65)), BREAK - 1.2, 0.22)
fx.add(S.rev_cymbal(0.75), BREAK - 0.75, 0.26)
fx.add(S.sub_drop(2.2, 200, 36), FINAL, 0.6)


# ---------------------------------------------------------------- effets sur repères
def nth(ctype):
    """Rang d'un repère parmi ceux de son type (pour monter la gamme au fil des apparitions)."""
    times = sorted(c['t'] for c in CUES if c['type'] == ctype)
    return lambda c: times.index(c['t'])


step_k = nth('step')
STEP_NOTES = [70, 75, 79, 81, 84]     # si♭, mi♭, sol (sur mi♭) puis la, do (sur fa) : la méthode monte


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


def deny(c):
    """Refus (croix sur la pige, les portails, les flyers) : deux notes sourdes qui descendent d'un demi-ton."""
    n = ns(0.34)
    out = np.zeros(n)
    for f, t0 in ((293.66, 0.0), (277.18, 0.12)):
        m = ns(0.18)
        t = tt(m)
        x = S.lp(np.sign(S.sine(f, m)) * 0.45 + S.sine(f, m) * 0.55, 1300) * np.exp(-t / 0.06) * np.minimum(1, t / 0.003)
        i = ns(t0)
        out[i:i + m] += x[: n - i]
    thump = S.pop(240, 110, 0.09)
    out[: len(thump)] += thump * 0.8
    return out


def hit(c):
    """Impact sur les deux grands passages à l'orange : accord joué + choc."""
    notes = [m + 12 for m in chord_at(c['t'] + 1e-3)[3]]
    return S.stab(notes, 1.2, 0.3) * 0.6 + np.pad(S.impact(), (0, ns(1.2) - ns(0.9))) * 0.6


def tab(c):
    """Changement d'onglet : petit clic et souffle bref."""
    w = S.whoosh(0.28, 700, 3000).mean(axis=1)
    k = S.click(2200, 0.005)
    w[: len(k)] += k * 0.7
    return w


SFX = {
    'type': (lambda c: S.click(3000 + S.rng.random() * 1500), 0.12, 0.03),
    'pop': (lambda c: S.pop(420, 820, 0.09), 0.3, 0.12),
    'deny': (deny, 0.42, 0.12),
    'step': (step, 0.28, 0.35),
    'tab': (tab, 0.22, 0.08),
    'swipe': (lambda c: S.whoosh(0.32, 900, 4200), 0.16, 0.08),
    'whoosh': (lambda c: S.whoosh(0.5, 250, 2400, rumble=0.3), 0.28, 0.12),
    'swoosh': (lambda c: S.whoosh(0.38, 450, 3400), 0.22, 0.1),
    'gold': (sparkle_on_chord, 0.28, 0.4),
    'notif': (chord_chime, 0.36, 0.3),
    'tick': (lambda c: S.tick(), 0.24, 0.1),
    'riser_short': (lambda c: S.riser(0.5, tone=(55, 67)), 0.26, 0.2),
    'hit': (hit, 0.38, 0.35),
    'zip': (lambda c: S.zip_(), 0.2, 0.1),
    'counter': (lambda c: S.counter_ticks(22, 1.4), 0.28, 0.05),
    'logo': (lambda c: S.sparkle((932.33, 1174.66, 1396.91, 1864.66), 0.06, 0.9), 0.36, 0.55),   # si♭ majeur
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
        print(f'{name:10s}', ' '.join(f'{S.rms_db(x[ns(a):ns(b)]):6.1f}' for a, b in ((0, 6), (6, 22), (22, 26), (26, 30), (30, 36))))

# ---------------------------------------------------------------- écriture (mixage de la voix off si un dossier voix/ est ajouté)
S.mix_voice(COMP, music, fx.x, wet)
