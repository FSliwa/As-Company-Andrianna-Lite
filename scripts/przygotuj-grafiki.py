#!/usr/bin/env python3
"""
Przygotowanie grafik serwisu: /Graphics  ->  /public/graphics

Co robi:
  1. obraca ujęcia zapisane bokiem,
  2. grupuje i nadaje czytelne nazwy,
  3. ROZCINA SKLEJKI „przed/po" na pojedyncze kadry (patrz niżej),
  4. przycina wtopione czarne pasy,
  5. skaluje do 1920 px dłuższego boku,
  6. nakłada jednolity grading koloru pod paletę marki,
  7. zapisuje JPEG q92 bez podpróbkowania koloru + warianty WebP
     (480 / 960 / 1440 / 1920 px) do srcSet,
  8. zapisuje manifest z wymiarami i wariantami.

Sklejki
-------
Dziewięć plików źródłowych to nie zdjęcia, tylko instagramowe kolaże
„przed / po" — dwa lub trzy kadry sklejone w pionie, z twardym szwem
i innym balansem bieli po każdej stronie. Użyte w ramkach o stałej
proporcji pokazują szew przez środek, dwie pary ust albo cztery oczy
w jednym kadrze. Skrypt wykrywa szwy (skok jasności między sąsiednimi
wierszami + różnica koloru po obu stronach) i zapisuje każdy panel jako
osobny plik `<nazwa>-p<n>.jpg`. Plik zbiorczy zostaje dla zgodności,
ale widoki powinny używać paneli.

Kompresja
---------
Źródła to kopie z komunikatora (już raz skompresowane, tablice kwantyzacji
782/657). Poprzednia wersja skryptu zapisywała q82 z podpróbkowaniem 4:2:0,
czyli tablice 1326/2000 — dokładała stratę, zwłaszcza w kolorze.
Teraz: q92, 4:4:4. Transfer ratuje srcSet: przeglądarka bierze wariant
WebP dopasowany do rozmiaru kadru zamiast pełnego JPEG-a.

Grading
-------
Transformacja wyliczona z pary: to samo zdjęcie (studio-05) w makiecie
i w oryginale. Biel 255/255/255 -> 248/234/219 (kremowy ton tła).
Dopasowanie jasności do CIEMNYCH sekcji robi komponent Figure (prop `tone`)
przez CSS — jeden plik, dwa konteksty.

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
MAX_DIM = 1920
JPEG_QUALITY = 92
WEBP_QUALITY = 84
VARIANT_WIDTHS = (480, 960, 1440, 1920)

# --- obroty ujęć zapisanych bokiem (indeks 1-based wg sortowania nazw) -------
ROT = {37: 'CW', 38: 'CW', 41: 'CW', 45: 'CW', 50: 'CW', 51: 'CCW', 57: 'CCW', 59: 'CCW'}

# --- przypisanie do grup ------------------------------------------------------
GROUPS = {
    'studio': list(range(1, 17)),
    'academy': [17, 18, 19, 20, 21, 22, 30, 31],
    'course': [23, 24, 25, 26, 27, 28, 29],
    'brows': [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
    'lips': [53, 54, 55, 57, 59],
}
SPECIAL = {32: 'cennik-refresh', 33: 'cennik-usuwanie', 34: 'cennik-pmu'}
SKIP = {56, 58, 60, 61, 62}

# --- sklejki do rozcięcia (nazwy po przypisaniu do grup) ---------------------
COLLAGES = {
    'brows-01', 'brows-02', 'brows-10', 'brows-12', 'brows-13', 'brows-18',
    'lips-01', 'lips-02', 'lips-03',
}
MIN_PANEL_FRAC = 0.22      # panel musi mieć >= 22% wysokości pliku

# Ręczne pozycje szwów (ułamek wysokości PO przycięciu czarnych pasów) dla
# sklejek, w których obie połówki mają zbyt podobny kolor, żeby automat
# je rozdzielił. Ustalone z podglądu paneli.
MANUAL_SEAMS = {
    'brows-01': [0.335, 0.665],
    'brows-02': [0.335, 0.665],
    'brows-10': [0.55],
    'brows-13': [0.28, 0.69],
    'brows-18': [0.29, 0.64],
    'lips-03': [0.335, 0.67],
}
SEAM_JUMP = 8.0            # skok średniej jasności między sąsiednimi wierszami
SEAM_RGB_DIFF = 12.0       # różnica koloru 60 px nad i pod szwem

# --- siła gradingu per grupa --------------------------------------------------
STRENGTH = {'studio': 1.0, 'academy': 1.0, 'brows': 1.0, 'lips': 1.0, 'course': 0.45, 'cennik': 0.45}
SRC_MEAN = np.array([207.8, 172.0, 156.5], dtype=np.float32)
DST_MEAN = np.array([200.2, 158.4, 132.6], dtype=np.float32)
SCALE = np.array([46.0 / 44.8, 54.1 / 58.8, 59.9 / 67.7], dtype=np.float32)


def build_lut(strength):
    x = np.arange(256, dtype=np.float32)[:, None]
    y = (x - SRC_MEAN[None, :]) * SCALE[None, :] + DST_MEAN[None, :]
    y = x * (1.0 - strength) + y * strength
    return np.clip(y, 0, 255).astype(np.uint8)


LUTS = {k: build_lut(v) for k, v in STRENGTH.items()}


def apply_grade(img, group):
    lut = LUTS.get(group)
    if lut is None:
        return img
    a = np.asarray(img)
    return Image.fromarray(np.stack([lut[a[:, :, c], c] for c in range(3)], axis=2))


# --- rozcinanie sklejek -------------------------------------------------------

def trim_black_bars(img, thresh=12):
    a = np.asarray(img.convert('L')).astype(np.float32)
    rows = a.mean(axis=1)
    keep = np.where(rows > thresh)[0]
    if len(keep) == 0:
        return img
    top, bottom = int(keep[0]), int(keep[-1]) + 1
    if top == 0 and bottom == a.shape[0]:
        return img
    return img.crop((0, top, img.width, bottom))


def find_seams(img):
    """Wiersze, w których kończy się jeden panel, a zaczyna następny."""
    a = np.asarray(img).astype(np.float32)
    H = a.shape[0]
    lum = (0.299 * a[:, :, 0] + 0.587 * a[:, :, 1] + 0.114 * a[:, :, 2]).mean(axis=1)
    jump = np.abs(np.diff(lum))
    band = 60
    cands = []
    lo, hi = int(H * MIN_PANEL_FRAC), int(H * (1 - MIN_PANEL_FRAC))
    for y in range(lo, hi):
        if jump[y] < SEAM_JUMP:
            continue
        above = a[max(0, y - band):y].reshape(-1, 3).mean(axis=0)
        below = a[y + 1:y + 1 + band].reshape(-1, 3).mean(axis=0)
        if np.abs(above - below).max() >= SEAM_RGB_DIFF:
            cands.append((y, jump[y]))
    # scal sąsiednie kandydatury — zostaw najsilniejszą w każdej grupie
    seams = []
    for y, s in sorted(cands):
        if seams and y - seams[-1][0] < int(H * MIN_PANEL_FRAC):
            if s > seams[-1][1]:
                seams[-1] = (y, s)
        else:
            seams.append((y, s))
    return [y for y, _ in seams]


def split_panels(img, name=None):
    img = trim_black_bars(img)
    if name in MANUAL_SEAMS:
        seams = [int(img.height * f) for f in MANUAL_SEAMS[name]]
    else:
        seams = find_seams(img)
    if not seams:
        return [img]
    bounds = [0] + [s + 1 for s in seams] + [img.height]
    panels = []
    for y0, y1 in zip(bounds, bounds[1:]):
        p = img.crop((0, y0, img.width, y1))
        p = trim_black_bars(p)
        if p.height >= int(img.height * MIN_PANEL_FRAC * 0.8):
            panels.append(p)
    return panels if len(panels) > 1 else [img]


# --- zapis --------------------------------------------------------------------

def save_all(img, name, group, manifest):
    w, h = img.size
    if max(w, h) > MAX_DIM:
        s = MAX_DIM / max(w, h)
        img = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
    img = apply_grade(img, group)

    jpg = os.path.join(OUT_DIR, f'{name}.jpg')
    img.save(jpg, 'JPEG', quality=JPEG_QUALITY, optimize=True, progressive=True, subsampling=0)

    variants = {}
    for vw in VARIANT_WIDTHS:
        if vw >= img.width and vw != VARIANT_WIDTHS[0]:
            if img.width not in variants:
                variants[img.width] = f'/graphics/{name}.webp'
                img.save(os.path.join(OUT_DIR, f'{name}.webp'), 'WEBP', quality=WEBP_QUALITY, method=6)
            continue
        vh = round(img.height * vw / img.width)
        v = img.resize((vw, vh), Image.LANCZOS)
        fn = f'{name}-{vw}.webp'
        v.save(os.path.join(OUT_DIR, fn), 'WEBP', quality=WEBP_QUALITY, method=6)
        variants[vw] = f'/graphics/{fn}'

    manifest[name] = {
        'src': f'/graphics/{name}.jpg',
        'w': img.width,
        'h': img.height,
        'webp': {str(k): v for k, v in sorted(variants.items())},
    }


def main():
    files = sorted(glob.glob(os.path.join(SRC_DIR, '*.jpeg')))
    if not files:
        raise SystemExit(f'Brak plików w {SRC_DIR}/')
    os.makedirs(OUT_DIR, exist_ok=True)
    for old in glob.glob(os.path.join(OUT_DIR, '*.webp')):
        os.remove(old)

    manifest = {}
    panel_report = {}

    def load(idx):
        im = Image.open(files[idx - 1]).convert('RGB')
        rot = ROT.get(idx)
        if rot == 'CW':
            im = im.rotate(-90, expand=True)
        elif rot == 'CCW':
            im = im.rotate(90, expand=True)
        return im

    def process(idx, name, group):
        im = load(idx)
        save_all(im, name, group, manifest)
        if name in COLLAGES:
            panels = split_panels(im, name)
            if len(panels) > 1:
                panel_report[name] = len(panels)
                for n, p in enumerate(panels, 1):
                    save_all(p, f'{name}-p{n}', group, manifest)

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

    print(f'Zapisano {len(manifest)} pozycji do {OUT_DIR}/')
    print('Rozcięte sklejki:', ', '.join(f'{k}→{v} paneli' for k, v in panel_report.items()) or 'brak')
    nie = COLLAGES - set(panel_report)
    if nie:
        print('UWAGA — nie wykryto szwów w:', ', '.join(sorted(nie)))


if __name__ == '__main__':
    main()
