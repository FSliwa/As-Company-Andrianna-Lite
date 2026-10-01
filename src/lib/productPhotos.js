/**
 * Zdjęcia produktów katalogu /pigmenty – packshoty od klientki (29.09.2026) z folderu
 * /Graphics, przez manifest src/lib/media.js (PRODUCTS, klucz 'product-' + id produktu
 * z src/data/pigments.json). Zdjęć ze sklepu nadal nie pokazujemy.
 *
 * Packshoty są na BIAŁYM tle i bez gradingu (wierna barwa pigmentu), dlatego na kremowym
 * polu karty idą z mix-blend-mode: multiply – białe tło przechodzi w ton pola, a nie stoi
 * na nim białym prostokątem. Wyjątek: zdjęcie zestawu na czarnym tle (blend: false) – stoi
 * jak zwykłe zdjęcie.
 *
 * Produkt bez zdjęcia → null (komponent pokazuje w tym samym polu próbkę koloru).
 */

import { PRODUCTS } from './media';

/* Packshoty, których tło nie jest białe – mnożenie nic by nie dało (czerń zostaje czernią). */
const DARK_BACKGROUND = new Set(['set-harley-quinn-do-ust']);

/** { image, blend } dla produktu o danym `id` albo null, gdy zdjęcia nie ma. */
export function productPhoto(id) {
  const image = PRODUCTS[`product-${id}`];
  if (!image) return null;
  return { image, blend: !DARK_BACKGROUND.has(id) };
}
