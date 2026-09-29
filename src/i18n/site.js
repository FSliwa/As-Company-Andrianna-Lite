/**
 * Dane z src/lib/site.js w danym języku.
 *
 * site.js zostaje jedynym źródłem liczb, cen, id i linków; pliki
 * src/content/site/{en,ru}.js podają wyłącznie przetłumaczone teksty
 * w tej samej strukturze (listy po indeksie). Pola `price` nie są tłumaczone
 * ręcznie – zapis ceny w danym języku liczy localizePriceString z tekstu polskiego
 * („1700 zł” → „1,700 PLN” / „1 700 PLN”). Działa na serwerze i w przeglądarce.
 * Importy względne z rozszerzeniem – plik ładuje też `node --test` (src/i18n/*.test.js).
 */

import * as PL from '../lib/site.js';
import EN from '../content/site/en.js';
import RU from '../content/site/ru.js';
import { merge } from './merge.js';
import { localizePriceString } from './format.js';

const OVERRIDES = { en: EN, ru: RU };
const cache = {};

const isPlainObject = (v) => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;

/** Każde pole `price` (tekst) w strukturze → zapis ceny w danym języku. */
function localizePrices(value, locale) {
  if (Array.isArray(value)) return value.map((item) => localizePrices(item, locale));
  if (!isPlainObject(value)) return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = key === 'price' && typeof item === 'string' ? localizePriceString(item, locale) : localizePrices(item, locale);
  }
  return out;
}

export function getSite(locale) {
  const over = OVERRIDES[locale];
  if (!over) return PL;
  if (!cache[locale]) {
    cache[locale] = Object.fromEntries(
      Object.entries(PL).map(([key, value]) => [key, localizePrices(merge(value, over[key]), locale)])
    );
  }
  return cache[locale];
}

/**
 * Pozycja listy znaleziona w danych POLSKICH, zwrócona w danym języku (ta sama
 * pozycja listy). Dla widoków, które szukają wiersza po polskiej nazwie:
 *   localizedFind(locale, 'PRICING_PMU', (i) => i.name === 'Korekta do 3 miesięcy')
 * Szukanie po przetłumaczonej nazwie nie zadziała – nazwy różnią się między językami.
 */
export function localizedFind(locale, key, predicate) {
  const source = PL[key];
  const list = Array.isArray(source) ? source : source && source.items;
  if (!Array.isArray(list)) return undefined;
  const index = list.findIndex(predicate);
  if (index === -1) return undefined;
  const localized = getSite(locale)[key];
  return (Array.isArray(localized) ? localized : localized.items)[index];
}
