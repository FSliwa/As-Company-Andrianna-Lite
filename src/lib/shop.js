/**
 * Sklep (/sklep) – czyste funkcje nad src/data/shop.json.
 *
 * Dane: plik edytowany RĘCZNIE wyłącznie z materiałów przekazanych przez Filipa – wiadomości
 * klientki (18.10.2026) i Kariny Lesiv (14.10.2026) oraz zdjęć z /Graphics (nazwy i pojemności
 * z opakowań). Decyzja Filipa z 18.10.2026: nic z dawnego sklepu klientki. Każdy produkt ma pole
 * `_source` (skąd pochodzi) – strona go nie pokazuje.
 *
 * Kształt produktu jak w pigmentach (src/lib/pigments.js) – ta sama lista „Twoje zamówienie”
 * i te same klocki katalogu: `collection` = id kategorii sklepu. Cena `null` = „cena na
 * zapytanie” (produkt bez ceny od klientki): bez „Dodaj”, z linkiem do zapytania. `presale` –
 * „Sprzedaż przedpremierowa” (słowa Kariny). Ceny w groszach.
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
/* Uzupełnienie pól wspólnych z pigmentami (komponenty katalogu ich oczekują). */
function normalize(catalog) {
  const products = catalog.products.map((p) => {
    const variants = p.variants.map((v) => ({ ...v, price: v.price ?? null }));
    return {
      series: null,
      isSet: false,
      zones: [],
      color: null,
      presale: false,
      ...p,
      variants,
      onRequest: variants.some((v) => v.price === null),
      /* cena od klientki – nie przeterminowuje się jak ceny pigmentów z 29.09 */
      clientPrice: true,
      inStock: variants.some((v) => v.inStock),
    };
  });
  const categories = catalog.categories.map((c) => ({ ...c, count: products.filter((p) => p.collection === c.id).length }));
  return { ...catalog, categories, products };
}

const data = normalize(withEnDash(raw));

/** Data cen podanych przez klientkę (ISO) – do podpisu „Ceny z …”. */
export const SHOP_PRICE_DATE = data.priceDate;

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
