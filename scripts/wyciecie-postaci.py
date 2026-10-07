#!/usr/bin/env python3
"""Wycięcie postaci (RGBA WebP) dla warstwy „tekst za postacią” w hero strony głównej.

Wejście: zdjęcie z public/graphics (już po gradingu – piksele postaci identyczne jak w hero)
i maska z scripts/wyciecie-postaci.swift. Wyjście: <nazwa>-wyciecie.webp (pełna szerokość)
i <nazwa>-wyciecie-960.webp – te same szerokości co warianty zdjęcia, więc przeglądarka
bierze parę o tej samej skali. Barwy bez zmian (tylko kanał alfa).
"""
import os
import sys

from PIL import Image

src, mask = sys.argv[1], sys.argv[2]
base = os.path.splitext(src)[0]
img = Image.open(src).convert('RGB')
alpha = Image.open(mask).convert('L').resize(img.size, Image.LANCZOS)
cut = img.copy()
cut.putalpha(alpha)
cut.save(f'{base}-wyciecie.webp', 'WEBP', quality=84, method=6)
cut.resize((960, round(img.height * 960 / img.width)), Image.LANCZOS).save(f'{base}-wyciecie-960.webp', 'WEBP', quality=84, method=6)
print('zapisano', f'{base}-wyciecie.webp', f'{base}-wyciecie-960.webp')
