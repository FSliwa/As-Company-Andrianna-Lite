#!/usr/bin/env python3
"""
Przygotowanie grafik serwisu: /Graphics  ->  /public/graphics

Co robi:
  1. obraca ujęcia zapisane bokiem,
  2. grupuje i nadaje czytelne nazwy,
  3. skaluje do 1800 px dłuższego boku,
  4. NAKŁADA JEDNOLITY GRADING KOLORU pod paletę marki,
  5. zapisuje manifest z wymiarami.

O gradingu
----------
W makiecie wszystkie zdjęcia są sprowadzone do jednej, ciepłej tonacji,
dzięki czemu zlewają się z kremowym i espresso tłem. Surowe pliki z folderu
mają zimne biele (zdjęcia grupowe) i różowe skóry (zbliżenia) — na kremowym
tle odstają.

Transformacja nie została dobrana „na oko". Zdjęcie hero w makiecie to ten sam
kadr co studio-05, więc dało się zmierzyć obie wersje tego samego zdjęcia
i wyliczyć mapowanie kanałów:

              R        G        B
  moje     207.8    172.0    156.5     (średnia)
  makieta  200.2    158.4    132.6
  odchyłka  -7.6    -13.6    -23.9     -> silne ściągnięcie niebieskiego

  out = (in - srednia_moja) * (odch_std_makiety / odch_std_moje) + srednia_makiety

Biel 255,255,255 przechodzi w 248,234,219 — czyli dokładnie w kremowy ton tła.

Siła gradingu zależy od rodzaju materiału:
  * zdjęcia (studio / academy / brows / lips) — 1.0
  * grafiki marki (course / cennik) — 0.45, bo mają własny, wtopiony grading;
    przy pełnej sile robią się mętne, a biały tekst traci kontrast.

Uruchomienie:  python3 scripts/przygotuj-grafiki.py
"""

import glob
import json
import os

import numpy as np
from PIL import Image

SRC_DIR = 'Graphics'
OUT_DIR = 'public/graphics'
MANIFEST = os.path.join(OUT_DIR, 'manifest.json')
MAX_DIM = 1800
JPEG_QUALITY = 82

# --- obroty ujęć zapisanych bokiem (indeks 1-based wg sortowania nazw) -------
ROT = {37: 'CW', 38: 'CW', 41: 'CW', 45: 'CW', 50: 'CW', 51: 'CCW', 57: 'CCW', 59: 'CCW'}

# --- przypisanie do grup ------------------------------------------------------
GROUPS = {
    'studio': list(range(1, 17)),                  # sesja wizerunkowa
    'academy': [17, 18, 19, 20, 21, 22, 30, 31],   # grupy z certyfikatami
    'course': [23, 24, 25, 26, 27, 28, 29],        # grafiki programów
    'brows': [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
    'lips': [53, 54, 55, 57, 59],
}
SPECIAL = {32: 'cennik-refresh', 33: 'cennik-usuwanie', 34: 'cennik-pmu'}
SKIP = {56, 58, 60, 61, 62}   # zrzuty z Instagrama + makieta referencyjna

# --- siła gradingu per grupa --------------------------------------------------
STRENGTH = {
    'studio': 1.0,
    'academy': 1.0,
    'brows': 1.0,
    'lips': 1.0,
    'course': 0.45,
    'cennik': 0.45,
}

# --- zmierzone parametry transformacji ---------------------------------------
SRC_MEAN = np.array([207.8, 172.0, 156.5], dtype=np.float32)
DST_MEAN = np.array([200.2, 158.4, 132.6], dtype=np.float32)
SCALE = np.array([46.0 / 44.8, 54.1 / 58.8, 59.9 / 67.7], dtype=np.float32)


def build_lut(strength: float) -> np.ndarray:
    """Tablica 256x3 mapująca wartość kanału na wartość po gradingu."""
    x = np.arange(256, dtype=np.float32)[:, None]
    y = (x - SRC_MEAN[None, :]) * SCALE[None, :] + DST_MEAN[None, :]
    y = x * (1.0 - strength) + y * strength
    return np.clip(y, 0, 255).astype(np.uint8)


LUTS = {k: build_lut(v) for k, v in STRENGTH.items()}


def apply_grade(img: Image.Image, group: str) -> Image.Image:
    lut = LUTS.get(group)
    if lut is None:
        return img
    a = np.asarray(img)
    return Image.fromarray(np.stack([lut[a[:, :, c], c] for c in range(3)], axis=2))


def main() -> None:
    files = sorted(glob.glob(os.path.join(SRC_DIR, '*.jpeg')))
    if not files:
        raise SystemExit(f'Brak plików w {SRC_DIR}/')
    os.makedirs(OUT_DIR, exist_ok=True)

    manifest = {}

    def process(idx: int, name: str, group: str) -> None:
        im = Image.open(files[idx - 1]).convert('RGB')

        rot = ROT.get(idx)
        if rot == 'CW':
            im = im.rotate(-90, expand=True)
        elif rot == 'CCW':
            im = im.rotate(90, expand=True)

        w, h = im.size
        if max(w, h) > MAX_DIM:
            s = MAX_DIM / max(w, h)
            im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)

        im = apply_grade(im, group)

        path = os.path.join(OUT_DIR, f'{name}.jpg')
        im.save(path, 'JPEG', quality=JPEG_QUALITY, optimize=True, progressive=True)
        manifest[name] = {'src': f'/graphics/{name}.jpg', 'w': im.width, 'h': im.height}

    used = set()
    for group, idxs in GROUPS.items():
        for n, i in enumerate(idxs, 1):
            process(i, f'{group}-{n:02d}', group)
            used.add(i)
    for i, name in SPECIAL.items():
        process(i, name, 'cennik')
        used.add(i)

    missing = [i for i in range(1, len(files) + 1) if i not in used and i not in SKIP]
    if missing:
        print('Pominięte poza listą SKIP:', missing)

    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)

    print(f'Zapisano {len(manifest)} plików do {OUT_DIR}/')
    print('Grading:', ', '.join(f'{k} {v}' for k, v in STRENGTH.items()))


if __name__ == '__main__':
    main()
