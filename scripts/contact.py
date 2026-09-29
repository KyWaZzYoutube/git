#!/usr/bin/env python3
"""Planche contact : assemble des images fixes en grille (usage interne de relecture)."""
import sys, os
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]
cols = 3 if len(files) > 4 else 2
tw = 640; th = 360
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw + (cols + 1) * 8, rows * (th + 30) + 8), (30, 30, 30))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x = 8 + (i % cols) * (tw + 8); y = 8 + (i // cols) * (th + 30)
    sheet.paste(im, (x, y))
    d.text((x + 4, y + th + 6), os.path.basename(f), fill=(230, 230, 230))
sheet.save(out)
print(out)
