/**
 * Zdjęcia produktów katalogu /pigmenty i sklepu /sklep – packshoty od klientki (29.09.2026) z folderu
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
const DARK_BACKGROUND = new Set(['set-harley-quinn-do-ust', 'ice-gel-ltb-2w1']);

/* Dodatkowe zdjęcia, które nie są packshotem na białym tle (grafiki z własnym tłem, kolaże –
   Karina 30.10.2026): bez mnożenia, na kremowym polu. */
const PLAIN = new Set([
  'kartridze-flat-supernatural-2',
  'pigmenty-supernatural-2',
  'pigmenty-supernatural-3',
  'pigmenty-supernatural-4',
]);

/* Zdjęcia, nie packshoty (lampa na statywie, szare tło) – na karcie sklepu na całe pole (object-cover). */
const COVER = new Set(['lampa-pierscieniowa']);

/** { image, blend, dark, cover } dla produktu o danym `id` albo null, gdy zdjęcia nie ma. */
export function productPhoto(id) {
  const image = PRODUCTS[`product-${id}`];
  if (!image) return null;
  const dark = DARK_BACKGROUND.has(id);
  const cover = COVER.has(id);
  return { image, blend: !dark && !PLAIN.has(id) && !cover, dark, cover };
}

/**
 * Wszystkie zdjęcia produktu do galerii w oknie: główne (product-<id>) i kolejne
 * product-<id>-2, -3… (Karina 30.10.2026: drugie zdjęcie skóry, kartridży, pędzla w innym
 * kolorze, grafiki Pigmentów Supernatural). `key` – id zdjęcia (wariant wskazuje je numerem).
 */
export function productPhotos(id) {
  const main = productPhoto(id);
  if (!main) return [];
  const out = [{ key: id, n: 1, ...main }];
  for (let n = 2; PRODUCTS[`product-${id}-${n}`]; n += 1) out.push({ key: `${id}-${n}`, n, ...productPhoto(`${id}-${n}`) });
  return out;
}
