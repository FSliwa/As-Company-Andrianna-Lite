/**
 * Portrety z sesji bez tła studia – postać wycięta maską (scripts/wyciecie-postaci.swift
 * + scripts/wyciecie-postaci.py: tylko kanał alfa, barwa skóry bez zmian). Na kremowych
 * sekcjach zamiast beżowego lub szarego tła studia (#B39D88–#F2E3D4) widać krem sekcji,
 * więc zdjęcie nie stoi na stronie jak prostokąt w innym kolorze (7.10.2026).
 * Używać tylko tam, gdzie pod zdjęciem jest jasne tło sekcji, z przezroczystym tłem
 * kafla: className="[&_.as-media]:bg-transparent".
 */

const cut = (name, w, h) => ({
  src: `/graphics/${name}-wyciecie.webp`,
  w,
  h,
  webp: {
    480: `/graphics/${name}-wyciecie-480.webp`,
    960: `/graphics/${name}-wyciecie-960.webp`,
    [w]: `/graphics/${name}-wyciecie.webp`,
  },
});

export const CUTOUTS = {
  'studio-01': cut('studio-01', 1068, 1600),
  'studio-02': cut('studio-02', 1068, 1600),
  'studio-10': cut('studio-10', 1068, 1600),
  'studio-14': cut('studio-14', 1600, 1068),
  'studio-15': cut('studio-15', 1068, 1600),
  'studio-16': cut('studio-16', 1068, 1600),
};

/** Wycięcie dla zdjęcia z media.js albo to samo zdjęcie, gdy wycięcia nie ma. */
export function cutoutFor(image) {
  const name = image?.src?.split('/').pop().replace(/\.(jpg|webp)$/, '');
  return (name && CUTOUTS[name]) || image;
}
