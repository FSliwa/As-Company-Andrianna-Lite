/**
 * Nakłada tłumaczenie na polskie źródło.
 *
 * Struktura (klucze, kolejność i długość list, liczby, ceny, id, href) pochodzi
 * z wersji polskiej; tłumaczenie podaje tylko teksty. Listy łączymy po indeksie,
 * obiekty po kluczach. Czego tłumaczenie nie poda, zostaje po polsku – lepsze
 * niż pusty element. Elementy React i funkcje traktujemy jak wartości (bez zaglądania).
 */

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !v.$$typeof && Object.getPrototypeOf(v) === Object.prototype;

export function merge(base, over) {
  if (over === undefined) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    return base.map((item, i) => merge(item, over[i]));
  }
  if (isPlainObject(base) && isPlainObject(over)) {
    const out = { ...base };
    for (const key of Object.keys(over)) out[key] = merge(base[key], over[key]);
    return out;
  }
  return over;
}

const cache = new WeakMap();

/** Słownik { pl, en, ru } → treść w danym języku (tłumaczenie nałożone na pl). */
export function pick(dict, locale) {
  if (!dict) return dict;
  if (!locale || locale === 'pl' || !dict[locale]) return dict.pl;
  let byLocale = cache.get(dict);
  if (!byLocale) cache.set(dict, (byLocale = {}));
  if (!byLocale[locale]) byLocale[locale] = merge(dict.pl, dict[locale]);
  return byLocale[locale];
}
