#!/usr/bin/env node
/**
 * Synchronizacja produktów SKLEPU (poza pigmentami i maszynką AS PRINCESS) z publicznego
 * Store API dawnego sklepu klientki → dwa pliki:
 *   src/data/shop.json          – dane STRONY /sklep (trafiają do paczki JS przeglądarki)
 *   scripts/shop-sync-meta.json – dane SKRYPTU: źródło, ceny bieżące ze sklepu, produkty pominięte
 *
 *   node scripts/sync-shop.mjs          # pobierz i zapisz
 *   node scripts/sync-shop.mjs --dry    # pobierz, pokaż raport i teksty, nie zapisuj
 *
 * Node 22, bez zależności. Zapytania sekwencyjne, z przerwą (jak sync-pigments.mjs).
 *
 * KATEGORIE – prośba klientki z 18.10.2026: „Produkty zmieniamy na słowo sklep. W sklepie:
 * Pigmenty, Maszynki, Kartridże, Akcesoria do rysunku, Akcesoria do ćwiczeń, Środki zabiegowe,
 * Lampy, Lasery”, „Katalog kartridży: Supernatural brows, Satellite”, „Ice Gel oraz peeling,
 * olejki do ust idą w kategorię Środki zabiegowe. Kredki, pędzle w akcesoria do rysunku. Skórki
 * w akcesoria do ćwiczeń”. Pigmenty i maszynka mają własne strony (/pigmenty, /maszynki).
 * Decyzja Filipa (18.10.2026): produkty, ceny i opisy z kategorii starego sklepu.
 *  - Kartridże: tylko SATELLITE (kartridży Supernatural Brows sklep nie ma – czekają na klientkę),
 *  - Akcesoria do rysunku: kredki i marker do rysunku wstępnego (pędzli sklep nie ma),
 *  - Akcesoria do ćwiczeń: skórki i usta do ćwiczeń,
 *  - Środki zabiegowe: cała kategoria „Produkty Przed i Po Zabiegowe”,
 *  - Lampy: „TheOne Ring”,
 *  - Lasery: sklep nie ma laserów („LASER / Remover” to zestawy removerów z kontaktem
 *    do trenerek dawnej firmy) – kategoria bez produktów, na stronie „zapytaj”.
 * Pominięte z kategorii źródłowych (np. Cup Holder) wypisuje raport i META.skipped.
 *
 * CENY: cena STANDARDOWA (`regular_price`), nie bieżąca ze sklepu – klientka 18.10.2026 przy
 * maszynce: „Cena standardowa jest 3500 zł” (sklep pokazywał cenę akcyjną). Bez przekreśleń
 * i bez „promocji” (Omnibus). Grosze, PLN.
 *
 * TEKSTY: te same reguły co pigmenty (htmlToText / htmlToLine z sync-pigments.mjs: bez tagów,
 * linków do sklepu i nazwy dawnej firmy) + zdania o osobach z dawnej firmy (PERSON_RE) usuwane
 * w całości. Trafienie, którego reguły nie usunęły, przerywa zapis (exit 1).
 *
 * Zdjęć produktów ze sklepu NIE zapisujemy – zdjęcia tylko z /Graphics (src/lib/productPhotos.js).
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMER_BRAND_RE, decodeEntities, htmlToLine, htmlToText } from './sync-pigments.mjs';

const API = 'https://as-loveliness.eu/wp-json/wc/store/v1';
const DELAY_MS = 350;
const UA = 'shop-catalog-sync/1.0 (+catalog sync; contact via site owner)';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/shop.json');
const META = path.join(ROOT, 'scripts/shop-sync-meta.json');

/** Kategorie strony w kolejności klientki (bez Pigmentów i Maszynek – osobne strony). */
const CATEGORIES = [
  { id: 'kartridze', name: 'Kartridże', from: 'kartridze', include: /\bSATELLITE\b/i },
  { id: 'akcesoria-do-rysunku', name: 'Akcesoria do rysunku', from: 'rysunek-wstepny', include: /kredk|marker|pędz|pedz/i },
  { id: 'akcesoria-do-cwiczen', name: 'Akcesoria do ćwiczeń', from: 'rysunek-wstepny', include: /skórk|skork|do ćwiczeń/i },
  { id: 'srodki-zabiegowe', name: 'Środki zabiegowe', from: 'produkty-przed-i-po-zabiegowe', include: null },
  { id: 'lampy', name: 'Lampy', from: 'theone-ring', include: null },
  { id: 'lasery', name: 'Lasery', from: null, include: null },
];

/* Osoby z dawnej firmy (autorka marki, trenerki) – zdanie z nimi znika w całości. */
const PERSON_RE = /Shakhov|Szachow|Pyrka|Perkowsk|Trenerk/i;

/* Nazwa dawnej firmy w opisach spoza pigmentów (reguły pigmentów jej tu nie obejmują). Wzorzec
   bez dosłownej nazwy – jak w sync-pigments.mjs. „marker X przeznaczony” → „marker przeznaczony”,
   „formuła tego balsamu, od X, została” → „formuła tego balsamu została”. */
const BRAND = String.raw`\bAS[\s_-]*COMPANY(?:\s*POLAND)?[^\S\n]*[™®]?`;
const SHOP_BRAND_RULES = [
  [new RegExp(String.raw`,[^\S\n]*od[^\S\n]+${BRAND}[^\S\n]*,`, 'giu'), ''],
  [new RegExp(String.raw`[^\S\n]+${BRAND}(?=[^\S\n]+\p{Ll})`, 'gu'), ''],
];
const stripShopBrand = (text) => SHOP_BRAND_RULES.reduce((s, [re, to]) => s.replace(re, to), String(text ?? ''));

/* Oczywiste literówki w nazwach sklepu (korekta pisowni, bez zmiany sensu). */
const NAME_FIXES = [[/\bStawberry\b/g, 'Strawberry']];

/* Krótki opis tylko, gdy jest naprawdę krótki (wiersz listy); dłuższy jest w „Szczegółach”. */
const SHORT_MAX = 160;

/* --------------------------------------------------------------------- args */

const DRY = process.argv.includes('--dry');
/* --current: cena bieżąca ze sklepu zamiast standardowej (decyzja do potwierdzenia z klientką) */
const PRICE_FIELD = process.argv.includes('--current') ? 'price' : 'regular_price';

/* --------------------------------------------------------------------- http */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;

async function getJson(url) {
  const wait = lastRequest + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    lastRequest = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { data: await res.json(), totalPages: Number(res.headers.get('x-wp-totalpages') || 1) };
    } catch (err) {
      lastErr = err;
      await sleep(1500 * attempt);
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
}

async function getAllPages(url) {
  const out = [];
  for (let page = 1; ; page += 1) {
    const sep = url.includes('?') ? '&' : '?';
    const { data, totalPages } = await getJson(`${url}${sep}per_page=100&page=${page}`);
    out.push(...data);
    if (page >= totalPages || data.length === 0) break;
  }
  return out;
}

/* --------------------------------------------------------------------- text */

/** Usuwa zdania z osobami z dawnej firmy (PERSON_RE); akapit bez zdań znika. */
export function stripPersons(text) {
  if (!text) return text;
  const out = String(text)
    .split(/\n{2,}/)
    .map((para) =>
      para
        .split('\n')
        .map((line) =>
          (line.match(/[^.!?]+[.!?]*\s*/g) || [line])
            .filter((sentence) => !PERSON_RE.test(sentence))
            .join('')
            .trim()
        )
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n\n');
  return out || null;
}

/* Sklep kończy opisy wariantowe wezwaniem „Wybierz dostępny wariant:” – na stronie wybór stoi obok. */
const TRAILING_RE = /\s*Wybierz dostępny wariant:?\s*$/i;

const clean = (html, oneLine = false) =>
  stripPersons(stripShopBrand(oneLine ? htmlToLine(html) : htmlToText(html)).replace(TRAILING_RE, '')) || null;

/** „Kartridż SATELLITE 25/1 RLLT” → „SATELLITE 25/1 RLLT” (sekcja ma już nagłówek „Kartridże”). */
function displayName(fullName) {
  return fullName.replace(/^Kartridż\s+/i, '').replace(/\s+/g, ' ').trim();
}
const fixName = (name) => NAME_FIXES.reduce((s, [re, to]) => s.replace(re, to), name);

/** Etykieta wariantu ze sklepu: „Pełne opakowanie 20szt” → „20 szt.”, „Pojedyncza sztuka” → „1 szt.”. */
function variantLabel(raw) {
  const s = decodeEntities(raw || '');
  const n = /(\d+)\s*szt/i.exec(s)?.[1];
  if (n) return `${n} szt.`;
  if (/pojedyncz/i.test(s)) return '1 szt.';
  return s.trim() || null;
}
const countOf = (label) => Number(/(\d+)/.exec(label || '')?.[1] ?? 0);

/** Pojemność z nazwy produktu prostego („Ice Gel Turquoise Pigment 15 ml”). */
function capacityFromName(name) {
  const m = /(\d+(?:[.,]\d+)?)\s*ml\b/i.exec(name);
  return m ? `${m[1].replace('.', ',')} ml` : null;
}

/* --------------------------------------------------------------------- main */

async function main() {
  console.log('→ kategorie sklepu');
  const { data: shopCats } = await getJson(`${API}/products/categories?per_page=100`);
  const catBySlug = new Map(shopCats.map((c) => [c.slug, c]));

  const products = [];
  const meta = {
    source: `${API}/products?category=<id>`,
    syncedAt: null,
    prices: PRICE_FIELD === 'price' ? 'bieżące (--current)' : 'standardowe (regular_price)',
    categories: {},
    currentPrices: {},
    skipped: [],
  };
  const brandHits = [];
  const seen = new Set();

  for (const cat of CATEGORIES) {
    if (!cat.from) {
      meta.categories[cat.id] = null;
      continue;
    }
    const sc = catBySlug.get(cat.from);
    if (!sc) throw new Error(`Brak kategorii sklepu „${cat.from}”`);
    meta.categories[cat.id] = { slug: sc.slug, id: sc.id, name: decodeEntities(sc.name) };
    console.log(`→ ${cat.name} ← ${decodeEntities(sc.name)} (${sc.count})`);
    const list = await getAllPages(`${API}/products?category=${sc.id}`);
    for (const p of list) {
      const fullName = fixName(decodeEntities(p.name).replace(/\s+/g, ' ').trim());
      if (cat.include && !cat.include.test(fullName)) {
        const elsewhere = CATEGORIES.some((c) => c !== cat && c.from === cat.from && c.include?.test(fullName));
        if (!elsewhere && !meta.skipped.some((x) => x.sourceId === p.id)) {
          meta.skipped.push({ category: cat.from, sourceId: p.id, name: fullName });
        }
        continue;
      }
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      const cur = p.prices.currency_code;
      if (cur !== 'PLN' || Number(p.prices.currency_minor_unit) !== 2) throw new Error(`${fullName}: waluta ${cur}`);

      let variants;
      if (p.type === 'variable' && p.variations?.length) {
        variants = [];
        for (const v of p.variations) {
          const { data: vd } = await getJson(`${API}/products/${v.id}`);
          const attr = v.attributes?.[0]?.value ?? String(vd.variation || '');
          const label = variantLabel(vd.variation || attr);
          variants.push({ label, price: Number(vd.prices[PRICE_FIELD]), inStock: Boolean(vd.is_in_stock), sourceId: vd.id });
          meta.currentPrices[vd.id] = Number(vd.prices.price);
        }
        variants.sort((a, b) => countOf(a.label) - countOf(b.label));
      } else {
        variants = [
          { label: capacityFromName(fullName), price: Number(p.prices[PRICE_FIELD]), inStock: Boolean(p.is_in_stock), sourceId: p.id },
        ];
        meta.currentPrices[p.id] = Number(p.prices.price);
      }

      const item = {
        id: p.slug,
        sourceId: p.id,
        name: displayName(fullName),
        fullName,
        collection: cat.id,
        series: null,
        isSet: false,
        zones: [],
        variants,
        shortDesc: clean(p.short_description, true),
        description: clean(p.description) || clean(p.short_description),
        inStock: variants.some((v) => v.inStock && v.price > 0),
        color: null,
      };
      /* opis = krótki opis (sklep trzyma treść tylko w jednym z pól) albo krótki opis za długi na wiersz */
      if (item.shortDesc && (item.shortDesc.length > SHORT_MAX || item.description?.replace(/\s+/g, ' ') === item.shortDesc)) item.shortDesc = null;
      for (const field of ['name', 'fullName', 'shortDesc', 'description']) {
        if (FORMER_BRAND_RE.test(item[field] || '') || PERSON_RE.test(item[field] || '')) brandHits.push(`${item.id} (${field})`);
      }
      if (variants.some((v) => !(v.price > 0))) console.warn(`  ! ${fullName}: cena 0 – produkt jako niedostępny`);
      products.push(item);
    }
  }

  const collator = new Intl.Collator('pl', { numeric: true, sensitivity: 'base' });
  const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));
  products.sort((a, b) => order.get(a.collection) - order.get(b.collection) || collator.compare(a.name, b.name));

  const syncedAt = new Date().toISOString();
  meta.syncedAt = syncedAt;
  const out = {
    syncedAt,
    currency: 'PLN',
    categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name, count: products.filter((p) => p.collection === c.id).length })),
    products,
  };

  console.log('\n=== raport');
  for (const c of out.categories) console.log(`${c.name}: ${c.count}`);
  for (const p of products) {
    console.log(`\n# ${p.collection} | ${p.id} | ${p.name} | ${p.variants.map((v) => `${v.label ?? '–'} ${v.price / 100} zł${v.inStock ? '' : ' (brak)'}`).join(' · ')}`);
    if (DRY) {
      if (p.shortDesc) console.log(`  krótki: ${p.shortDesc}`);
      if (p.description) console.log(`  opis: ${p.description.replace(/\n/g, ' ⏎ ')}`);
    }
  }
  if (meta.skipped.length) console.log('\nPominięte:', meta.skipped.map((s) => s.name).join('; '));

  if (brandHits.length) {
    console.error(`\n✗ Nazwa dawnej firmy albo jej osoby w tekstach (${brandHits.length}): ${brandHits.join(', ')}`);
    if (!DRY) process.exit(1);
  }
  if (DRY) return console.log('\n(--dry) nie zapisano.');
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
  await writeFile(META, JSON.stringify(meta, null, 2) + '\n');
  console.log(`\n✓ zapisano ${path.relative(ROOT, OUT)} i ${path.relative(ROOT, META)}`);
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
