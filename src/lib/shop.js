/**
 * Sklep (/sklep) – czyste funkcje nad src/data/shop.json.
 *
 * Dane: WYŁĄCZNIE publiczne Store API dawnego sklepu klientki, odświeżane skryptem
 *
 *   node scripts/sync-shop.mjs
 *
 * (kategorie i zakres – prośba klientki z 18.10.2026, opis w skrypcie). Nie dopisujemy tu
 * niczego ręcznie. Produkty mają ten sam kształt co pigmenty (src/lib/pigments.js), więc
 * korzystają z tej samej listy „Twoje zamówienie” i tych samych klocków katalogu:
 * `collection` = id kategorii sklepu, `zones` puste, `color` null. Ceny w groszach –
 * STANDARDOWE ze sklepu (bez promocji, Omnibus).
 *
 * Kategorie sklepu w menu „Sklep” (src/lib/site.js → NAV_ALL[0]): Pigmenty i Maszynki
 * mają własne strony, pozostałe – sekcje tej strony (kotwica = id kategorii).
 */

import raw from '@/data/shop.json';

/* Myślnik długi ze sklepu → półpauza (jak w src/lib/pigments.js). */
const EM_DASH = /\u2014/g;
function withEnDash(value) {
  if (typeof value === 'string') return value.replace(EM_DASH, '–');
  if (Array.isArray(value)) return value.map(withEnDash);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withEnDash(v)]));
  }
  return value;
}
const data = withEnDash(raw);

/** Ile dni po synchronizacji ceny uznajemy za aktualne – ta sama zasada co pigmenty. */
export const SHOP_PRICE_MAX_AGE_DAYS = 14;

/** Data synchronizacji z API sklepu (ISO). */
export const SHOP_SYNCED_AT = data.syncedAt;

/** Czy ceny sklepu są starsze niż SHOP_PRICE_MAX_AGE_DAYS (albo data jest nieczytelna). */
export function shopPricesExpired(now = Date.now(), catalog = data) {
  const synced = new Date(catalog.syncedAt).getTime();
  if (!Number.isFinite(synced)) return true;
  return now - synced > SHOP_PRICE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

/** Kategorie sklepu z danych (bez Pigmentów i Maszynek): [{ id, name, count }]. */
export function shopCategories(catalog = data) {
  return catalog.categories;
}

export function shopCategoryById(id, catalog = data) {
  return catalog.categories.find((c) => c.id === id) ?? null;
}

/** Wszystkie produkty sklepu, posortowane: kategoria → nazwa. */
export function shopProducts(catalog = data) {
  return catalog.products;
}

/** Produkt sklepu po `id` (slug ze sklepu) albo po `sourceId`. */
export function shopProductById(id, catalog = data) {
  return catalog.products.find((p) => p.id === id || p.sourceId === id) ?? null;
}

/** Produkty jednej kategorii. */
export function shopProductsIn(categoryId, catalog = data) {
  return catalog.products.filter((p) => p.collection === categoryId);
}

/** Czy produkt (z dowolnego katalogu) jest produktem sklepu, a nie pigmentem. */
export const isShopProduct = (product) => Boolean(product && shopCategoryById(product.collection));
