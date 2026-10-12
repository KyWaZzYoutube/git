#!/usr/bin/env python3
"""
Fonds « soie orange » de la landing page (landing/img/silk-*.jpg), calculés image par image.

Une surface de tissu est modélisée par une carte de hauteur (plis parallèles qui ondulent,
déformés par un champ lent), éclairée comme un satin : diffus orange, reflets crème très
serrés, ombres presque noires. Un masque garde le tissu sur les bords et laisse le centre sombre
pour le texte. Aucune image externe : le résultat est libre de droits.

  python3 scripts/landing_silk.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'landing', 'img')


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def silk(w, h, seed, angle=0.35, folds=4.5, warp=0.55, mask=None, light=(-0.55, -0.75, 0.55), gloss=60.0):
    """Rendu d'un satin orange (w×h, RVB 0-1). mask(x, y) → présence du tissu (0-1)."""
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:h, 0:w].astype(float)
    x /= w
    y /= w                                   # mêmes unités sur les deux axes
    # champ lent qui courbe les plis
    wx = sum(rng.uniform(0.3, 1.0) * np.sin(2 * np.pi * (rng.uniform(0.3, 0.9) * x + rng.uniform(0.2, 0.8) * y) + rng.uniform(0, 6.3))
             for _ in range(3)) * warp
    wy = sum(rng.uniform(0.3, 1.0) * np.sin(2 * np.pi * (rng.uniform(0.2, 0.8) * x - rng.uniform(0.3, 0.9) * y) + rng.uniform(0, 6.3))
             for _ in range(3)) * warp
    c, s = np.cos(angle), np.sin(angle)
    u = (x + 0.12 * wx) * c + (y + 0.12 * wy) * s          # coordonnée transverse aux plis
    v = -(x + 0.12 * wx) * s + (y + 0.12 * wy) * c
    hgt = np.zeros_like(x)
    for k in range(5):                                      # plis de largeurs différentes
        f = folds * rng.uniform(0.6, 1.6) * (1.0 + 0.55 * k)
        a = 1.0 / (1.0 + 0.9 * k) ** 1.6
        ph = rng.uniform(0, 6.3) + 1.6 * np.sin(2 * np.pi * rng.uniform(0.3, 1.0) * v + rng.uniform(0, 6.3))
        hgt += a * np.sin(2 * np.pi * f * u + ph)
    hgt /= 2.2
    # normales (gradient en unités de pixels → pente)
    gy, gx = np.gradient(hgt, 1.0 / w)
    k = 0.035                                               # relief
    nx, ny, nz = -gx * k, -gy * k, np.ones_like(hgt)
    n = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    nx, ny, nz = nx / n, ny / n, nz / n
    L = np.array(light, float)
    L /= np.linalg.norm(L)
    Hv = L + np.array([0, 0, 1.0])
    Hv /= np.linalg.norm(Hv)
    diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    spec = np.clip(nx * Hv[0] + ny * Hv[1] + nz * Hv[2], 0, 1) ** gloss
    sheen = np.clip(1 - nz, 0, 1) ** 0.8                    # bords des plis plus clairs (velours du satin)
    # palette : presque noir → orange profond → orange Première Immo → crème
    t = np.clip(diff ** 2.2 * 1.15 + 0.25 * sheen, 0, 1)
    stops = np.array([[0.02, 0.006, 0.0], [0.30, 0.06, 0.0], [0.86, 0.26, 0.0], [1.0, 0.318, 0.0], [1.0, 0.55, 0.28]])
    pos = np.array([0.0, 0.3, 0.62, 0.8, 1.0])
    rgb = np.stack([np.interp(t, pos, stops[:, i]) for i in range(3)], -1)
    rgb += spec[..., None] * np.array([1.0, 0.82, 0.68]) * 0.9
    if mask is not None:
        m = mask(x, y * w / h)                              # masque en coordonnées 0-1 sur chaque axe
        rgb *= m[..., None]
    return np.clip(rgb, 0, 1)


def save(rgb, name, blur=0.6, grain=0.018, seed=0, quality=86):
    rng = np.random.default_rng(seed)
    rgb = rgb + rng.normal(0, grain, rgb.shape[:2])[..., None] * (0.3 + rgb)   # grain de film, plus visible dans la lumière
    im = Image.fromarray((np.clip(rgb, 0, 1) ** (1 / 1.0) * 255).astype(np.uint8))
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    path = os.path.join(OUT, name)
    im.save(path, quality=quality, optimize=True, progressive=True)
    print(path, im.size, f'{os.path.getsize(path) / 1024:.0f} Ko')


def hero_mask(x, y):
    """Tissu sur les côtés et en bas, centre sombre pour le titre et la vidéo."""
    side = smoothstep(0.30, 0.02, x) + smoothstep(0.70, 0.98, x)
    low = smoothstep(0.55, 1.0, y) * 0.65
    wave = smoothstep(0.18, 0.0, np.abs(y - (0.95 - 0.55 * x)) - 0.08) * 0.35     # une vague qui traverse en diagonale
    centre = 1 - 0.85 * np.exp(-(((x - 0.5) / 0.24) ** 2 + ((y - 0.42) / 0.36) ** 2))
    return np.clip(np.maximum(np.maximum(side, low), wave), 0, 1) * centre


def band_mask(x, y):
    """Grande vague lumineuse qui monte vers la droite (section rendez-vous, appel final)."""
    crest = 0.75 - 0.45 * x - 0.12 * np.sin(np.pi * x)
    m = smoothstep(-0.05, 0.25, y - crest)
    return np.clip(m * (0.35 + 0.65 * smoothstep(0.0, 0.6, y)), 0, 1)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    save(silk(2400, 1350, seed=11, angle=0.55, folds=3.2, mask=hero_mask), 'silk-hero.jpg', seed=1)
    save(silk(1000, 760, seed=23, angle=-0.6, folds=2.4, gloss=45.0), 'silk-card.jpg', seed=2)
    save(silk(2400, 1100, seed=31, angle=0.9, folds=2.2, warp=0.7, mask=band_mask, light=(-0.3, -0.85, 0.5)), 'silk-band.jpg', seed=3)
