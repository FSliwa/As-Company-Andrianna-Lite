/**
 * Katalog pigmentów – czyste funkcje nad src/data/pigments.json.
 *
 * Dane pochodzą WYŁĄCZNIE z publicznego Store API sklepu klienta (WooCommerce,
 * kategoria „Pigmenty” + pigmenty spoza niej – zob. ZAKRES w skrypcie) i są
 * odświeżane skryptem:
 *
 *   node scripts/sync-pigments.mjs
 *
 * Nie dopisujemy tu niczego ręcznie. Ten plik trafia do paczki JS przeglądarki,
 * więc skrypt zapisuje w nim tylko pola, które strona pokazuje. Ceny są
 * w groszach (PLN); `price` to cena BIEŻĄCA ze sklepu. Ceny regularnej i flagi
 * promocji tu NIE MA (są w scripts/pigments-sync-meta.json, tylko do wiedzy) –
 * strona nie pokazuje przekreśleń ani „promocji” (brak najniższej ceny z 30 dni,
 * Omnibus).
 *
 * `color` to odcień POGLĄDOWY wyznaczony z miniatury produktu (analiza lokalna;
 * zdjęć sklepu nie publikujemy) – `null`, gdy nie dało się go wiarygodnie ustalić
 * (zestawy, biały pigment).
 *
 * Kształt produktu:
 *   { id, sourceId, name, fullName, collection, series, isSet, zones[],
 *     variants: [{ label, price, inStock, sourceId }],
 *     shortDesc, description, inStock, color }
 */

import raw from '@/data/pigments.json';
import rawClient from '@/data/pigments-client.json';
import { shopCategoryById, shopProductById } from '@/lib/shop';

/* Myślnik: w danych ze sklepu bywa długi (U+2014); na stronie zawsze półpauza „–” (decyzja Filipa
   z 29.09). Zamieniamy przy odczycie, nie w pliku – tłumaczenia opisów (pigments.i18n.json)
   są przypięte do skrótu polskiego tekstu z pliku, więc plik zostaje taki, jak ze sklepu. */
const EM_DASH = /\u2014/g;
function withEnDash(value) {
  if (typeof value === 'string') return value.replace(EM_DASH, '\u2013');
  if (Array.isArray(value)) return value.map(withEnDash);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withEnDash(v)]));
  }
  return value;
}
/*
 * Katalog wg klientki i Kariny (decyzja Filipa z 18.10.2026: „wprowadź tak, jak prosiła klientka”).
 *
 * Grupy – klientka 14.10.2026: „Katalog pigmentów dzielimy na: pigmenty SUPERNATURAL BROWS, pigmenty
 * AS opium (usta, brwi), pigmenty AS Classic (usta, brwi), pigmenty AS opium light”; SUPERNATURAL
 * BROWS = kolekcja Hairstrokes (decyzja Filipa). Lista Kariny z 14.10.2026 zostawia też kolekcje
 * Harley Quinn i Paradise (dodaje ich zestawy, usuwa część odcieni) – osobne grupy na końcu.
 * Areola/Camouflage i Trichopigmentation – „Należy zabrać wszystkie pigmenty z kolekcji”.
 *
 * CLIENT_REMOVED – pozycje, które Karina kazała „zabrać”; dane w src/data/pigments.json zostają
 * bez zmian (to kopia danych z 29.09), filtr działa tutaj. CLIENT_EXTRA – nowe pozycje z listy
 * Kariny (src/data/pigments-client.json, np. „Hairstrokes Set Collaboration”, przedsprzedaż).
 * `name` w grupie – nazwa na stronie (inna niż w danych).
 */
export const CLIENT_GROUPS = [
  { id: 'hairstrokes', name: 'SUPERNATURAL BROWS' },
  { id: 'as-opium' },
  { id: 'as-classic' },
  { id: 'as-opium-light-minerals' },
  { id: 'harley-quinn' },
  { id: 'paradise' },
];

/** Strefy w filtrze katalogu – podział klientki: „usta, brwi” (reszta produktów widoczna w „Wszystkie”). */
export const FILTER_ZONES = ['brwi', 'usta'];

/* Lista Kariny z 14.10.2026 – „Na stronie nie powinno być…”, „Proszę zabrać…”, „Należy zabrać…”. */
export const CLIENT_REMOVED = new Set([
  // HAIRSTROKES: H1–H5
  'hairstrokes-h1-brown-2',
  'hairstrokes-h2-warm-brown',
  'hairstrokes-h3-light-brown',
  'hairstrokes-h4-warm-light-brown',
  'hairstrokes-h5-neutral-brown',
  // AS OPIUM LIGHT MINERALS: Dark Brown Haired, Dark Blonde, Brown Haired, Blonde; kreski E1–E5
  'as-opium-light-minerals-pigments-dark-brown-haired',
  'as-opium-light-minerals-pigments-dark-blonde',
  'as-opium-light-minerals-pigments-brown-haired',
  'as-opium-light-minerals-pigments-blonde',
  'e1-black-6-ml-opium-light',
  'e2-light-brown-6-ml-opium-light',
  'e3-warm-brown-6-ml-opium-light',
  'e4-yellow-golden-6-ml-opium-light',
  'e5-dark-brown-6-ml-opium-light',
  // HARLEY QUINN: Crazy, Pudding
  'crazy-harley-quinn-6-ml',
  'pudding-harley-quinn-6ml',
  // PARADISE: Gabriella, Lilith, Madonna, Maria Magdalena
  'gabrielle-6-ml-paradise',
  'lilith-6-ml-paradise',
  'madonna-6-ml-paradise',
  'maria-magdalena-6-ml-paradise-2',
  // AS CLASSIC: 11 odcieni ust, kreski Black Diamond i Deep Black, modyfikatory For Blue Gray i For Red
  ...[
    'apple-flirt', 'barbie', 'bloody-mary', 'bubble-gum', 'cherry', 'juicy-peach', 'nude', 'nut-pie',
    'raspberry', 'red-queen', 'red-ruby', 'black-diamond', 'deep-black', 'for-blue-gray-eyebrows',
    'for-red-eyebrows',
  ].map((s) => `as-classic-pigments-${s}`),
  // AS OPIUM USTA: 13 odcieni; kreski Ultra Black
  ...[
    'almonds', 'blood', 'chilli-peppers', 'dark-scarlet', 'ferrari', 'geisha', 'lychee', 'papaya',
    'pink-peach', 'red-royal', 'salmon', 'skin', 'toffee',
  ].map((s) => `as-opium-pigments-${s}`),
  'ultra-black-6-ml-pigment-do-kresek',
]);

const CLIENT_EXTRA = rawClient.products;

function clientCatalog(full) {
  const byId = new Map(full.collections.map((c) => [c.id, c]));
  const order = new Map(CLIENT_GROUPS.map((g, i) => [g.id, i]));
  /* sortowanie stabilne – w obrębie kolekcji kolejność z danych (odcienie → zestawy), nowe na końcu */
  const products = [...full.products.filter((p) => !CLIENT_REMOVED.has(p.id)), ...CLIENT_EXTRA]
    .filter((p) => order.has(p.collection))
    .sort((a, b) => order.get(a.collection) - order.get(b.collection) || Number(a.isSet) - Number(b.isSet));
  /* liczby kolekcji z pozycji, które zostały (w danych – stan sprzed listy Kariny) */
  const collections = CLIENT_GROUPS.filter((g) => byId.has(g.id)).map((g) => {
    const items = products.filter((p) => p.collection === g.id);
    return {
      ...byId.get(g.id),
      ...(g.name ? { name: g.name } : {}),
      count: items.length,
      shades: items.filter((p) => !p.isSet).length,
      sets: items.filter((p) => p.isSet).length,
      zones: full.zones.map((z) => z.id).filter((z) => items.some((p) => p.zones.includes(z))),
    };
  });
  return { ...full, collections, products };
}

const data = clientCatalog(withEnDash(raw));

const NBSP = ' ';

/* ---------------- dane ---------------- */

/** Strefy użyte w katalogu, w stałej kolejności: [{ id, name }]. */
export const ZONES = data.zones;

/** Data synchronizacji z API sklepu (ISO). */
export const SYNCED_AT = data.syncedAt;

/**
 * Ile dni po synchronizacji ceny uznajemy za aktualne. Starsze → strona
 * zamiast kwot pisze „cena do potwierdzenia” (sklep prowadzi akcje czasowe,
 * a Store API nie podaje ich końca). WARTOŚĆ DO POTWIERDZENIA Z KLIENTEM;
 * przy automatycznej synchronizacji (np. codziennej) nigdy nie zadziała.
 */
export const PRICE_MAX_AGE_DAYS = 14;

/** Czy ceny z danych są starsze niż PRICE_MAX_AGE_DAYS (albo data jest nieczytelna). */
export function pricesExpired(now = Date.now(), catalog = data) {
  const synced = new Date(catalog.syncedAt).getTime();
  if (!Number.isFinite(synced)) return true;
  return now - synced > PRICE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

/** Kolekcje: [{ id, name, count, shades, sets, zones[] }]. */
export function collections(catalog = data) {
  return catalog.collections;
}

/* Lista „Twoje zamówienie” jest wspólna dla /pigmenty i /sklep (src/lib/shop.js – produkty
   w tym samym kształcie): wyszukiwanie po id w domyślnym katalogu zagląda też do sklepu,
   a „kolekcja” produktu sklepu to jego kategoria. */
export function collectionById(id, catalog = data) {
  return catalog.collections.find((c) => c.id === id) ?? (catalog === data ? shopCategoryById(id) : null);
}

/** Wszystkie produkty (odcienie + zestawy), posortowane: kolekcja → odcienie → zestawy. */
export function products(catalog = data) {
  return catalog.products;
}

/** Produkt po `id` (slug ze sklepu) albo po `sourceId`. */
export function productById(id, catalog = data) {
  return catalog.products.find((p) => p.id === id || p.sourceId === id) ?? (catalog === data ? shopProductById(id) : null);
}

export function zoneLabel(id, catalog = data) {
  return catalog.zones.find((z) => z.id === id)?.name ?? id;
}

export function collectionLabel(id, catalog = data) {
  return collectionById(id, catalog)?.name ?? id;
}

/* ---------------- filtry ---------------- */

/**
 * Filtr listy produktów.
 * @param {Array} list
 * @param {{ collection?: string|null, zone?: string|null, sets?: 'include'|'exclude'|'only' }} [opts]
 *   `collection`/`zone` puste (null, '', 'all') = bez filtra.
 */
export function filterProducts(list, { collection = null, zone = null, sets = 'include' } = {}) {
  const any = (v) => v === null || v === undefined || v === '' || v === 'all';
  return list.filter(
    (p) =>
      (any(collection) || p.collection === collection) &&
      (any(zone) || p.zones.includes(zone)) &&
      (sets === 'include' || (sets === 'only' ? p.isSet : !p.isSet))
  );
}

export const byCollection = (list, collection) => filterProducts(list, { collection });
export const byZone = (list, zone) => filterProducts(list, { zone });

/** Strefy obecne w danej liście (np. po wybraniu kolekcji), w kolejności ZONES. */
export function zonesIn(list, catalog = data) {
  const present = new Set(list.flatMap((p) => p.zones));
  return catalog.zones.filter((z) => present.has(z.id));
}

/** Liczba produktów w strefie (opcjonalnie w obrębie kolekcji). */
export function countBy(list, { collection = null, zone = null, sets = 'include' } = {}) {
  return filterProducts(list, { collection, zone, sets }).length;
}

/* ---------------- ceny ---------------- */

/**
 * Grosze → „149 zł” (twarda spacja przed „zł”), „149,50 zł” gdy są grosze.
 * Bez separatora tysięcy – jak w sklepie („1800 zł”). Nieliczba → ''.
 */
export function formatPrice(grosze) {
  const n = Number(grosze);
  if (!Number.isFinite(n)) return '';
  const sign = n < 0 ? '-' : '';
  const abs = Math.round(Math.abs(n));
  const zl = Math.floor(abs / 100);
  const gr = abs % 100;
  return `${sign}${zl}${gr ? `,${String(gr).padStart(2, '0')}` : ''}${NBSP}zł`;
}

/** „6 ml” z twardą spacją (etykiety w danych mają zwykłą). */
export function formatCapacity(label) {
  return label ? String(label).replace(/\s+/g, NBSP) : '';
}

/**
 * Cena do karty / wiersza:
 *   jeden wariant           → „149 zł”
 *   kilka wariantów         → „6 ml 149 zł · 15 ml 219 zł”
 * Warianty bez etykiety pojemności pokazują samą cenę.
 */
export function priceLabel(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return '';
  if (variants.length === 1) return formatPrice(variants[0].price);
  return variants
    .map((v) => (v.label ? `${formatCapacity(v.label)}${NBSP}${formatPrice(v.price)}` : formatPrice(v.price)))
    .join(' · ');
}

/** Najniższa cena bieżąca (grosze) albo null. */
export function minPrice(variants) {
  const prices = (variants || []).map((v) => Number(v.price)).filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : null;
}

/** „od 149 zł” przy kilku różnych cenach, inaczej „149 zł”. */
export function priceFromLabel(variants) {
  const prices = new Set((variants || []).map((v) => Number(v.price)));
  const min = minPrice(variants);
  if (min === null) return '';
  return prices.size > 1 ? `od${NBSP}${formatPrice(min)}` : formatPrice(min);
}

/** Pojemności produktu: „6 ml” / „6 ml · 15 ml” / '' (zestawy, brak danych). */
export function capacityLabel(variants) {
  return (variants || [])
    .map((v) => v.label)
    .filter(Boolean)
    .map(formatCapacity)
    .join(' · ');
}

/** Wariant po etykiecie pojemności (albo pierwszy, gdy etykiety brak). */
export function findVariant(product, label = null) {
  if (!product?.variants?.length) return null;
  if (label === null || label === undefined) return product.variants[0];
  return product.variants.find((v) => v.label === label) ?? null;
}

/* ---------------- zamówienie (zapytanie, bez płatności) ---------------- */

/**
 * Podsumowanie listy „Twoje zamówienie”.
 * @param {Array<{ productId: string|number, label?: string|null, qty: number }>} entries
 * @returns {{ lines: Array<{ product, variant, qty, total: number, item: string, text: string }>, total: number, count: number }}
 *   `item` np. „Japanese Garden (AS OPIUM), 6 ml × 2” (bez ceny), `text` = `item` + „ – 298 zł”.
 *   Pozycje nieznane są pomijane.
 */
export function orderSummary(entries, catalog = data) {
  const lines = [];
  for (const e of entries || []) {
    const product = productById(e.productId, catalog);
    const variant = findVariant(product, e.label ?? null);
    const qty = Math.max(1, Math.floor(Number(e.qty) || 1));
    if (!product || !variant) continue;
    const total = variant.price * qty;
    const what = [
      `${product.name} (${collectionLabel(product.collection, catalog)})`,
      variant.label ? formatCapacity(variant.label) : null,
    ]
      .filter(Boolean)
      .join(', ');
    const item = `${what} × ${qty}`;
    lines.push({ product, variant, qty, total, item, text: `${item} – ${formatPrice(total)}` });
  }
  return {
    lines,
    total: lines.reduce((sum, l) => sum + l.total, 0),
    count: lines.reduce((sum, l) => sum + l.qty, 0),
  };
}

/* ---------------- statystyki ---------------- */

/**
 * Liczby do nagłówka/hero – wszystkie wyliczone z danych:
 *   shades       – liczba odcieni (bez zestawów)
 *   sets         – liczba zestawów
 *   collections  – liczba kolekcji z produktami
 *   capacities   – pojemności pojedynczych odcieni, rosnąco (np. ['6 ml', '12 ml', '15 ml'])
 *   syncedAt     – data synchronizacji (ISO)
 */
export function stats(catalog = data) {
  const shades = catalog.products.filter((p) => !p.isSet);
  const ml = (label) => Number(String(label).replace(',', '.').replace(/\s*ml$/, ''));
  const capacities = [...new Set(shades.flatMap((p) => p.variants.map((v) => v.label)).filter(Boolean))].sort(
    (a, b) => ml(a) - ml(b)
  );
  return {
    shades: shades.length,
    sets: catalog.products.length - shades.length,
    collections: catalog.collections.filter((c) => c.count > 0).length,
    capacities,
    syncedAt: catalog.syncedAt,
  };
}

/** Data synchronizacji jako „29.09.2026” (strefa Europe/Warsaw – ten sam wynik na serwerze i w przeglądarce). */
export function formatSyncedDate(iso = data.syncedAt) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day')}.${get('month')}.${get('year')}`;
}
