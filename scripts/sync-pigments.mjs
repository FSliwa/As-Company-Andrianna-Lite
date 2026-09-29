#!/usr/bin/env node
/**
 * Synchronizacja katalogu pigmentów z publicznego Store API sklepu klienta
 * (WooCommerce, AS LOVELINESS) → dwa pliki:
 *   src/data/pigments.json          — dane STRONY (trafiają do paczki JS przeglądarki):
 *                                     tylko pola, które strona pokazuje
 *   scripts/pigments-sync-meta.json — dane SKRYPTU (nie importuje ich kod strony):
 *                                     źródło, ceny regularne i flaga promocji
 *                                     (tylko do wiedzy — Omnibus), `colorMeta`
 *
 *   node scripts/sync-pigments.mjs                 # pobierz i zapisz
 *   node scripts/sync-pigments.mjs --dry           # pobierz, pokaż raport, nie zapisuj
 *   node scripts/sync-pigments.mjs --thumbs=<dir>  # dodatkowo pobierz miniatury do <dir>
 *                                                  # (TYLKO do analizy koloru — nigdy do public/)
 *   node scripts/sync-pigments.mjs --cache=<dir>   # zapisuj/odczytuj surowe odpowiedzi API
 *
 * Node 22, bez zależności. Zapytania idą sekwencyjnie, z przerwą (grzecznie
 * wobec serwera sklepu).
 *
 * ZASADY (każda decyzja wynika z danych API, nie z ręcznych wpisów):
 *  - Produkty: kategoria „Pigmenty” (slug `pigmenty`), wszystkie strony.
 *    ZAKRES (decyzja 29.09.2026 — klient chce PEŁNY katalog pigmentów na
 *    stronie): dołączamy też pigmenty, którym sklep nie nadał kategorii
 *    „Pigmenty”, a które są w jego kategoriach pigmentowych:
 *      · wszystko z „Sety Pigmentów” (`base-set`),
 *      · z kategorii kolekcji — produkty z „Pigment” w nazwie.
 *    Pakiety z gratisami (kategoria „Pakiety”) zostają poza katalogiem.
 *    Każdy taki produkt jest wypisywany na konsoli („spoza kategorii Pigmenty”)
 *    — gdy sklep nada mu kategorię „Pigmenty”, po prostu zniknie z tej listy.
 *  - Warianty produktów `variable`: każdy wariant pobierany osobno
 *    (/products/<id_wariantu>) — cena BIEŻĄCA (`prices.price`) i „Pojemność”.
 *  - Kolekcja: kategorie kolekcji w sklepie. Przynależność liczona z filtra
 *    `?category=<id>` (pole `categories` produktu bywa niepełne), z rozróżnieniem
 *    przypisania bezpośredniego i odziedziczonego po podkategorii. Remis → wzorzec
 *    nazwy. Brak kategorii → wzorzec nazwy. Zestaw, którego wymienione w opisie
 *    składniki należą jednoznacznie do innej kolekcji → kolekcja składników.
 *  - Strefy: kategorie stref w sklepie (OPIUM Usta, AS Brwi, …). Gdy produkt ich
 *    nie ma → jednoznaczne słowa w krótkim opisie („do kreski”) → przynależność do
 *    zestawu sklepu o znanej strefie (składnik wymieniony w opisie zestawu albo
 *    rodzina z nazwy zestawu, gdy zestaw nie wymienia składników). Nadal brak →
 *    pusta tablica i wpis w `doubts`.
 *  - Kolor próbki (`color`) NIE jest liczony tutaj — robi to osobna analiza
 *    miniatur (poza repozytorium). Skrypt zachowuje wcześniej wyznaczony kolor,
 *    dopóki miniatura produktu w sklepie się nie zmieni (`colorMeta[id].from`).
 *  - Blokada Omnibus: nazwa, krótki opis i opis nie mogą mówić o promocji,
 *    rabacie ani obniżce (strona nie pokazuje najniższej ceny z 30 dni).
 *    Trafienie przerywa zapis (exit 1) — decyzję podejmuje człowiek.
 *
 * Zdjęć produktów ze sklepu NIE zapisujemy w danych strony ani w public/.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ------------------------------------------------------------------ config */

const API = 'https://as-loveliness.eu/wp-json/wc/store/v1';
const PIGMENTS_SLUG = 'pigmenty';
const SETS_SLUG = 'base-set'; // „Sety Pigmentów”
const PACKAGES_SLUG = 'pakiety'; // „Pakiety” — tylko jako źródło wiedzy o zestawach
const DELAY_MS = 350;
const UA = 'AS-COMPANY-site-sync/1.0 (+catalog sync; contact via site owner)';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/pigments.json');
const META = path.join(ROOT, 'scripts/pigments-sync-meta.json');

/* Słowa promocji/obniżki w tekstach produktu (Omnibus). „%” łapiemy tylko jako
   „-40%” (minus przed liczbą, nie w środku kodu jak „L2-50%”) — retencja
   „60% do 90%” i proporcje mieszanek nie są obniżką. „SALE” tylko wielkimi
   literami (polskie „sale” to liczba mnoga od „sala”). */
const PROMO_RES = [/promocj|rabat|przecen|obniż|wyprzeda|taniej|okazj|gratis|(?<![\p{L}\d])-\s?\d+\s?%/iu, /\bSALE\b/u];

/** Kolekcje strony ← kategorie sklepu (po slugu) + wzorzec nazwy (rozstrzyganie). */
const COLLECTIONS = [
  { id: 'as-opium', slug: 'kolekcja-as-opium', name: /\bAS Opium Pigments\b|\bOPIUM COLORS\b|\bAS OPIUM\b(?! LIGHT)/i },
  { id: 'as-opium-light-minerals', slug: 'kolekcja-as-opium-light-minerals', name: /\bOPIUM LIGHT\b|\bLIGHT MINERALS\b|\bMINERALS OPIUM LIGHT\b/i },
  { id: 'as-classic', slug: 'kolekcja-as-classic', name: /\bAS Classic\b/i },
  { id: 'paradise', slug: 'kolekcja-paradise', name: /\(PARADISE\)|\bSet PARADISE\b/i },
  { id: 'harley-quinn', slug: 'kolekcja-harley-quinn', name: /\bHARLEY QUINN\b/i },
  { id: 'hairstrokes', slug: 'kolekcja-hairstrokes', name: /\bHAIR ?STROKES\b/i },
  { id: 'areola-camouflage', slug: 'areola-camouflage', name: /\((AREOLA|CAMOUFLAGE)\)|\bSet AREOLA\b/i },
  { id: 'trichopigmentation', slug: 'trichopigmentation', name: /\bTRICHO/i },
];

/** Kolejność i etykiety stref (etykiety to nazwy filtrów na stronie). */
const ZONES = [
  { id: 'brwi', name: 'Brwi' },
  { id: 'usta', name: 'Usta' },
  { id: 'kreski', name: 'Kreski' },
  { id: 'modyfikatory', name: 'Modyfikatory i korektory' },
  { id: 'areola', name: 'Areola' },
  { id: 'camouflage', name: 'Kamuflaż' },
  { id: 'skora-glowy', name: 'Skóra głowy' },
];
const ZONE_ORDER = ZONES.map((z) => z.id);

/** Strefy ← kategorie sklepu (po slugu). `byName` = strefę rozstrzyga nazwa produktu. */
const ZONE_CATEGORIES = [
  { slug: 'as-brwi', zone: 'brwi' },
  { slug: 'opium-brwi', zone: 'brwi' },
  { slug: 'as-usta', zone: 'usta' },
  { slug: 'opium-usta', zone: 'usta' },
  { slug: 'as-kreski', zone: 'kreski' },
  { slug: 'opium-kreski', zone: 'kreski' },
  { slug: 'as-korektory', zone: 'modyfikatory' },
  { slug: 'opium-modyfikatory', zone: 'modyfikatory' },
  { slug: 'as-opium-light-modyfikatory', zone: 'modyfikatory' },
  {
    slug: 'areola-camouflage',
    byName: [
      [/\bAREOLA\b/i, 'areola'],
      [/\bCAMOUFLAGE\b/i, 'camouflage'],
    ],
  },
  { slug: 'trichopigmentation', zone: 'skora-glowy' },
];

/** Serie ← podkategorie sklepu. */
const SERIES_CATEGORIES = [
  { slug: 'as-opium-colors', series: 'COLORS' },
  { slug: 'as-opium-organic', series: 'ORGANIC' },
  { slug: 'as-classic', series: 'CLASSIC' },
  { slug: 'as-classic-concentrate', series: 'CONCENTRATE' },
];

/** Jednoznaczne słowa strefy w tekście sklepu (krótki opis, nazwa zestawu, nagłówek sekcji). */
const ZONE_WORDS = [
  ['areola', /\bareola\b|\botocz\w*/i],
  ['camouflage', /\bcamouflage\b|\bkamufla\w*/i],
  ['skora-glowy', /\btrichopigment\w*/i],
  ['usta', /\bdo ust\b|\busta\b|\blips?\b/i],
  ['brwi', /\bdo brwi\b|\bbrwi\b|\beyebrows?\b/i],
  ['kreski', /\bdo kres(?:ki|ek)\b|\bkresek\b|\bkreski\b|\beyeliner\b/i],
  ['modyfikatory', /\bkorektor\w*|\bcorrector\w*|\bmodyfikator\w*/i],
];

/* ------------------------------------------------------------------- args */

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  })
);
const DRY = Boolean(args.dry);
const CACHE = typeof args.cache === 'string' ? path.resolve(args.cache) : null;
const THUMBS = typeof args.thumbs === 'string' ? path.resolve(args.thumbs) : null;

if (THUMBS && THUMBS.startsWith(path.join(ROOT, 'public'))) {
  console.error('✗ --thumbs nie może wskazywać do public/ — zdjęć ze sklepu nie publikujemy.');
  process.exit(1);
}

/* ------------------------------------------------------------------- http */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;

async function politeFetch(url) {
  const wait = lastRequest + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    lastRequest = Date.now();
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      await sleep(1500 * attempt);
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
}

async function getJson(url) {
  const key = CACHE ? path.join(CACHE, encodeURIComponent(url.replace(API, '')) + '.json') : null;
  if (key && existsSync(key)) return JSON.parse(await readFile(key, 'utf8'));
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const body = { data: await res.json(), totalPages: Number(res.headers.get('x-wp-totalpages') || 1) };
  if (key) {
    await mkdir(CACHE, { recursive: true });
    await writeFile(key, JSON.stringify(body));
  }
  return body;
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

/* ------------------------------------------------------------------- text */

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—',
  hellip: '…', bdquo: '„', rdquo: '”', ldquo: '“', rsquo: '’', lsquo: '‘', laquo: '«',
  raquo: '»', deg: '°', times: '×', trade: '™', reg: '®', copy: '©', middot: '·', bull: '•',
};

export function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED_ENTITIES[n.toLowerCase()] ?? m)
    .replace(/ /g, ' ')
    .replace(/[​‌‍﻿]/g, '');
}

const SHOP_URL_RE = /https?:\/\/(?:www\.)?as-loveliness\.eu\S*/gi;

/** HTML → tekst jednoliniowy. */
export function htmlToLine(html) {
  const text = decodeEntities(String(html ?? '').replace(/<[^>]+>/g, ' '));
  return text.replace(SHOP_URL_RE, '').replace(/\s+/g, ' ').trim();
}

/**
 * HTML → tekst z akapitami: akapity rozdzielone "\n\n", punkty listy jako
 * osobne linie "• …" w jednym akapicie. Bez tagów, bez linków do sklepu.
 */
export function htmlToText(html) {
  let s = String(html ?? '');
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li\b[^>]*>/gi, '\n• ');
  s = s.replace(/<\/li>/gi, '\n');
  s = s.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n\n');
  s = s.replace(/<\/(p|div|h[1-6]|table|tr|blockquote)>/gi, '\n\n');
  s = s.replace(/<(p|div|h[1-6]|table|tr|blockquote)\b[^>]*>/gi, '\n\n');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s).replace(SHOP_URL_RE, '');
  const blocks = s
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split('\n')
        .map((l) => l.replace(/[ \t]+/g, ' ').trim())
        .filter((l) => l && l !== '•')
        .join('\n')
    )
    .filter(Boolean);
  // Kolejne punkty listy trafiają do jednego akapitu.
  const merged = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (prev && prev.startsWith('• ') && b.startsWith('• ')) merged[merged.length - 1] = `${prev}\n${b}`;
    else merged.push(b);
  }
  return merged.join('\n\n') || null;
}

/** Linie „elementów” opisu (li, h4/h5, strong, p) — do wykrywania składników zestawów. */
function descriptionItems(html) {
  const s = String(html ?? '');
  const items = [];
  const re = /<(li|h[1-6]|strong|b|p)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(s))) {
    const text = htmlToLine(m[2]);
    if (text) items.push({ index: m.index, text });
  }
  return items.sort((a, b) => a.index - b.index).map((i) => i.text);
}

/** Wyraz CAŁY WIELKIMI → Wielka Pierwsza; kody (E5, #6, T4) i „AS” bez zmian. */
function titleWord(w) {
  if (!/[A-ZĄĆĘŁŃÓŚŹŻ]/.test(w) || /[a-ząćęłńóśźż]/.test(w)) return w;
  if (/\d/.test(w) || w.replace(/[^A-Z]/g, '') === 'AS') return w;
  return w
    .split(/([-/])/)
    .map((part) => part.replace(/[A-ZĄĆĘŁŃÓŚŹŻ]+/, (m) => m[0] + m.slice(1).toLowerCase()))
    .join('');
}
const titleCase = (s) => s.split(' ').map(titleWord).join(' ');

const CAPACITY_RE = /,?\s*\b(\d+(?:[.,]\d+)?)\s*ml\b/i;
const COLLECTION_TAG_RE = /\s*\((OPIUM LIGHT|TRICHOPIGMENTATION|CAMOUFLAGE|AREOLA|PARADISE|HARLEY QUINN)\)\s*/gi;
const LINE_PREFIX_RE = /^(AS Opium Light Minerals Pigments|AS Opium Pigments|AS Classic Pigments|HAIRSTROKES)\s+/i;

/** Czytelna nazwa odcienia (bez kolekcji i pojemności). Zestawy: pełna nazwa bez pojemności. */
function displayName(fullName, isSet) {
  let s = fullName;
  s = s.replace(CAPACITY_RE, ' ');
  if (!isSet) {
    s = s.replace(COLLECTION_TAG_RE, ' ');
    s = s.replace(LINE_PREFIX_RE, '');
    s = s.replace(/\s+[–-]\s+(?=[a-ząćęłńóśźż])[^–]*$/, ''); // „ – pigment do kresek”
    s = s.replace(/^([A-Z#]{0,2}\d{1,2})\s*[–-]\s*/, '$1 '); // „H6 – DARK BROWN”
  }
  s = s.replace(/\s+/g, ' ').replace(/\s+,/g, ',').replace(/[,\s]+$/, '').trim();
  return titleCase(s);
}

function capacityFromName(fullName) {
  const m = CAPACITY_RE.exec(fullName);
  return m ? `${m[1].replace('.', ',')} ml` : null;
}

function normalizeCapacity(raw) {
  const m = /(\d+(?:[.,]\d+)?)\s*ml/i.exec(String(raw ?? ''));
  return m ? `${m[1].replace('.', ',')} ml` : null;
}

const mlOf = (label) => (label ? Number(label.replace(',', '.').replace(/\s*ml$/, '')) : null);

/** Klucz porównania nazw: małe litery, bez „#”, spacje pojedyncze. */
const key = (s) =>
  decodeEntities(s)
    .toLowerCase()
    .replace(/#/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

/** Klucze produktu do dopasowań: nazwa i nazwa bez kodu (E1, T4, #1). */
function productKeys(name) {
  const k = key(name);
  const keys = new Set([k]);
  const noCode = k.replace(/^([a-z]{0,2}\d{1,2})\s+/, '');
  if (noCode !== k) keys.add(noCode);
  return keys;
}

/** Klucze kandydata z linii opisu zestawu: „L2-JAPANESE GARDEN”, „CRAZY (RED-BROWN…) – …”, „Dark blonde 15 ml”. */
function itemKeys(text) {
  const out = new Set();
  const parts = [text, text.split(/\s+[–-]\s+/)[0]];
  for (const p of parts) {
    let k = key(p)
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\b\d+(?:[.,]\d+)?\s*ml\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!k || k.length > 40) continue;
    out.add(k);
    const noHyphenCode = k.replace(/^[a-z]{1,2}\d{1,2}\s*-\s*/, '');
    out.add(noHyphenCode);
    out.add(noHyphenCode.replace(/\s+(organic|hybrid)$/, ''));
  }
  return out;
}

function zonesFromWords(text) {
  return ZONE_WORDS.filter(([, re]) => re.test(text)).map(([z]) => z);
}

/** Nagłówek sekcji w opisie zestawu: „4 Pigmenty do ust”, „Pigment do kresek”, „Corrector do PMU”. */
function sectionZone(text) {
  if (text.length > 40) return null;
  if (!/^(\d+\s+)?(pigment\w*|corrector\w*|korektor\w*|modyfikator\w*)\b/i.test(text)) return null;
  const zones = zonesFromWords(text);
  return zones.length === 1 ? zones[0] : null;
}

const sortZones = (zs) => [...new Set(zs)].sort((a, b) => ZONE_ORDER.indexOf(a) - ZONE_ORDER.indexOf(b));

/* ------------------------------------------------------------------- main */

async function main() {
  const syncedAt = new Date().toISOString();
  const doubts = [];
  const doubt = (sourceId, name, text) => doubts.push({ sourceId, name, text });

  console.log('→ kategorie');
  const categories = await getAllPages(`${API}/products/categories`);
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const catById = new Map(categories.map((c) => [c.id, c]));
  const need = (slug) => {
    const c = catBySlug.get(slug);
    if (!c) throw new Error(`Brak kategorii „${slug}” w sklepie — sprawdź mapowanie.`);
    return c;
  };

  /** Potomkowie kategorii (po `parent`). */
  const descendants = (id) => {
    const out = new Set();
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      for (const c of categories) if (c.parent === cur && !out.has(c.id)) (out.add(c.id), stack.push(c.id));
    }
    return out;
  };

  console.log('→ produkty kategorii „Pigmenty”');
  const pigCat = need(PIGMENTS_SLUG);
  const raw = await getAllPages(`${API}/products?category=${pigCat.id}`);
  const rawById = new Map(raw.map((p) => [p.id, p]));
  console.log(`  ${raw.length} produktów (sklep: ${pigCat.count})`);

  /** Przynależność do kategorii wg filtra API (obejmuje podkategorie). */
  const membership = new Map();
  const products158AndRefs = new Map(raw.map((p) => [p.id, p]));
  const members = async (slug) => {
    const c = need(slug);
    if (!membership.has(c.id)) {
      const list = await getAllPages(`${API}/products?category=${c.id}`);
      for (const p of list) if (!products158AndRefs.has(p.id)) products158AndRefs.set(p.id, p);
      membership.set(c.id, new Set(list.map((p) => p.id)));
    }
    return membership.get(c.id);
  };

  console.log('→ przynależność do kolekcji, stref, serii, zestawów');
  for (const c of COLLECTIONS) await members(c.slug);
  for (const z of ZONE_CATEGORIES) await members(z.slug);
  for (const s of SERIES_CATEGORIES) await members(s.slug);
  const setMembers = await members(SETS_SLUG);
  const packageMembers = await members(PACKAGES_SLUG);

  /* ---------- zakres katalogu: „Pigmenty” + pigmenty spoza tej kategorii ---------- */
  // Zob. ZAKRES w nagłówku. Kolejność: jak w odpowiedziach API (stabilna).
  const extras = [];
  const extraCandidates = new Set([
    ...setMembers,
    ...COLLECTIONS.flatMap((c) => [...membership.get(need(c.slug).id)]),
  ]);
  for (const id of extraCandidates) {
    if (rawById.has(id) || packageMembers.has(id)) continue;
    const p = products158AndRefs.get(id);
    if (setMembers.has(id) || /pigment/i.test(decodeEntities(p.name))) extras.push(p);
  }
  const catalogRaw = [...raw, ...extras];
  const catalogById = new Map(catalogRaw.map((p) => [p.id, p]));
  if (extras.length) {
    console.log(`  + ${extras.length} spoza kategorii „Pigmenty”: ${extras.map((p) => `${p.id} „${decodeEntities(p.name)}”`).join(', ')}`);
  }

  /** Bezpośrednie vs odziedziczone przypisanie produktu do kategorii. */
  const relation = (p, catId) => {
    if (!membership.get(catId)?.has(p.id)) return null;
    const own = new Set((p.categories || []).map((c) => c.id));
    if (own.has(catId)) return 'direct';
    const desc = descendants(catId);
    return [...own].some((id) => desc.has(id)) ? 'inherited' : 'direct';
  };

  const isSetProduct = (p) => setMembers.has(p.id) || /\bSET\b/i.test(decodeEntities(p.name));

  /* ---------- kolekcja: kategorie → wzorzec nazwy ---------- */
  function collectionOf(p, log = true) {
    const name = decodeEntities(p.name);
    const byName = COLLECTIONS.filter((c) => c.name.test(name)).map((c) => c.id);
    const direct = [];
    const inherited = [];
    for (const c of COLLECTIONS) {
      const rel = relation(p, need(c.slug).id);
      if (rel === 'direct') direct.push(c.id);
      else if (rel === 'inherited') inherited.push(c.id);
    }
    const pick = (list, label) => {
      if (list.length === 1) return list[0];
      const hit = list.filter((id) => byName.includes(id));
      if (hit.length === 1) {
        if (log) doubt(p.id, name, `W sklepie w kilku kolekcjach (${label}: ${list.join(', ')}) — wybrano „${hit[0]}” wg nazwy.`);
        return hit[0];
      }
      return null;
    };
    let chosen = null;
    let via = null;
    if (direct.length) (chosen = pick(direct, 'bezpośrednio')), (via = 'category');
    if (!chosen && inherited.length) (chosen = pick(inherited, 'przez podkategorie')), (via = 'category');
    if (!chosen && byName.length === 1) (chosen = byName[0]), (via = 'name');
    if (log && chosen && byName.length === 1 && byName[0] !== chosen) {
      doubt(p.id, name, `Kategoria sklepu wskazuje „${chosen}”, a nazwa „${byName[0]}” — zostawiono kategorię.`);
    }
    return { collection: chosen, via, byName };
  }

  /* ---------- produkty: pola podstawowe ---------- */
  const items = catalogRaw.map((p) => {
    const fullName = decodeEntities(p.name).replace(/\s+/g, ' ').trim();
    const isSet = isSetProduct(p);
    const { collection, via } = collectionOf(p);
    if (!collection) doubt(p.id, fullName, 'Nie udało się ustalić kolekcji — produkt pominięty w filtrach kolekcji.');

    let series = null;
    for (const s of SERIES_CATEGORIES) if (membership.get(need(s.slug).id).has(p.id)) series = s.series;

    const catZones = [];
    for (const z of ZONE_CATEGORIES) {
      if (!membership.get(need(z.slug).id).has(p.id)) continue;
      if (z.zone) catZones.push(z.zone);
      else for (const [re, zone] of z.byName) if (re.test(fullName)) catZones.push(zone);
    }

    return {
      raw: p,
      sourceId: p.id,
      id: p.slug,
      name: displayName(fullName, isSet),
      fullName,
      collection,
      collectionVia: via,
      series,
      isSet,
      catZones: sortZones(catZones),
      shortDesc: htmlToLine(p.short_description) || null,
      description: htmlToText(p.description),
      inStock: Boolean(p.is_in_stock),
      onSale: Boolean(p.on_sale),
      thumbnail: p.images?.[0]?.thumbnail || null,
    };
  });
  const itemById = new Map(items.map((i) => [i.sourceId, i]));

  /* ---------- zestawy: składniki z opisu → kolekcja i strefy ---------- */
  // Zestawy z katalogu + pakiety sklepu spoza niego (tylko jako źródło wiedzy).
  const refSets = [...products158AndRefs.values()].filter((p) => {
    const name = decodeEntities(p.name);
    if (catalogById.has(p.id)) return isSetProduct(p);
    return setMembers.has(p.id) || (packageMembers.has(p.id) && /pigment/i.test(name));
  });
  const shades = items.filter((i) => !i.isSet);
  const shadeKeys = shades.map((s) => ({ s, keys: productKeys(s.name) }));

  function setZones(p) {
    const name = decodeEntities(p.name);
    const zones = [];
    for (const z of ZONE_CATEGORIES) {
      if (!membership.get(need(z.slug).id).has(p.id)) continue;
      if (z.zone) zones.push(z.zone);
      else for (const [re, zone] of z.byName) if (re.test(name)) zones.push(zone);
    }
    if (!zones.length) zones.push(...zonesFromWords(name));
    if (!zones.length) {
      const m = /\bpigment\w*\s+do\s+(ust|brwi|kres(?:ki|ek))\b/i.exec(htmlToLine(p.description));
      if (m) zones.push(...zonesFromWords(`do ${m[1]}`));
    }
    return sortZones(zones);
  }

  function matchMembers(p, preferCollection) {
    const found = [];
    let zone = null;
    const own = setZones(p);
    for (const text of descriptionItems(p.description)) {
      const sz = sectionZone(text);
      if (sz) {
        zone = sz;
        continue;
      }
      const ks = itemKeys(text);
      const hits = shadeKeys.filter(({ keys }) => [...ks].some((k) => keys.has(k))).map(({ s }) => s);
      if (!hits.length) continue;
      const pref = hits.filter((s) => s.collection === preferCollection);
      const chosen = pref.length === 1 ? pref[0] : hits.length === 1 ? hits[0] : null;
      if (chosen && !found.some((f) => f.shade === chosen)) {
        found.push({ shade: chosen, zone: zone ?? (own.length === 1 ? own[0] : null), text });
      }
    }
    return found;
  }

  const propagated = new Map(); // sourceId → [{zone, setId, setName}]
  for (const p of refSets) {
    const setName = decodeEntities(p.name);
    const inCatalog = itemById.get(p.id);
    let coll = inCatalog ? inCatalog.collection : collectionOf(p, false).collection;
    let found = matchMembers(p, coll);

    // Kolekcja zestawu wg jednoznacznej kolekcji jego składników.
    const memberColls = [...new Set(found.map((f) => f.shade.collection))];
    if (memberColls.length === 1 && memberColls[0] !== coll && found.length >= 3) {
      const msg = `Zestaw w kategorii kolekcji „${coll}”, ale wszystkie rozpoznane składniki (${found
        .map((f) => f.shade.name)
        .join(', ')}) należą do „${memberColls[0]}” — przypisano „${memberColls[0]}”.`;
      coll = memberColls[0];
      if (inCatalog) {
        inCatalog.collection = coll;
        inCatalog.collectionVia = 'set-members';
        doubt(p.id, setName, msg);
      }
      found = matchMembers(p, coll);
    }

    // Zestaw bez listy składników: rodzina z nazwy zestawu („Set MINERALS OPIUM LIGHT”,
    // „EYEBROW SET HAIR STROKES”). Rodzina musi być WŁAŚCIWYM podzbiorem produktów
    // kategorii kolekcji w sklepie — nazwa zestawu równa nazwie kolekcji
    // („Pigmenty do brwi AS CLASSIC”) niczego nie rozstrzyga.
    const own = setZones(p);
    if (!found.length && own.length === 1 && coll) {
      const STOP = new Set(['set', 'zestaw', 'eyebrow', 'eyebrows', 'lip', 'lips', 'do', 'brwi', 'ust', 'kresek', 'base', 'hybrid', 'organic', 'gratis', 'pigmentów', 'pigmenty', 'pigments', 'as', 'for', 'the']);
      const tokens = key(setName)
        .replace(/[^a-ząćęłńóśźż0-9 ]/g, ' ')
        .split(' ')
        .filter((t) => t.length > 1 && !STOP.has(t) && !/^\d+$/.test(t));
      const collCat = membership.get(need(COLLECTIONS.find((c) => c.id === coll).slug).id);
      const pool = shades.filter((s) => collCat.has(s.sourceId));
      if (tokens.length) {
        const fam = pool.filter((s) => tokens.every((t) => key(s.fullName).replace(/\s+/g, '').includes(t)));
        if (fam.length && fam.length < pool.length) {
          for (const s of fam) found.push({ shade: s, zone: own[0], text: `(rodzina „${tokens.join(' ')}”)`, family: true });
        }
      }
    }

    if (inCatalog) inCatalog.setZones = own;
    for (const f of found) {
      if (!f.zone) continue;
      const list = propagated.get(f.shade.sourceId) || [];
      list.push({ zone: f.zone, setId: p.id, setName, family: Boolean(f.family), inCatalog: Boolean(inCatalog) });
      propagated.set(f.shade.sourceId, list);
    }
  }

  /* ---------- strefy: kategorie → słowa w krótkim opisie → zestawy ---------- */
  for (const it of items) {
    if (it.isSet) {
      const zs = sortZones([...(it.catZones || []), ...(it.setZones || [])]);
      // Sekcje opisu (Base Set: „Pigmenty do ust / do brwi / do kresek”).
      const sectionZones = descriptionItems(it.raw.description).map(sectionZone).filter(Boolean);
      it.zones = sortZones([...zs, ...sectionZones]);
      it.zonesVia = 'set';
    } else if (it.catZones.length) {
      it.zones = it.catZones;
      it.zonesVia = 'category';
    } else {
      const words = zonesFromWords(it.shortDesc || '');
      if (words.length === 1) {
        it.zones = words;
        it.zonesVia = 'short-description';
      } else {
        const prop = propagated.get(it.sourceId) || [];
        const zs = sortZones(prop.map((x) => x.zone));
        if (zs.length === 1) {
          it.zones = zs;
          it.zonesVia = prop.every((x) => x.family) ? 'set-family' : 'set-member';
          const sets = [...new Set(prop.map((x) => `„${x.setName}”${x.inCatalog ? '' : ' (zestaw spoza kategorii Pigmenty)'}`))];
          if (it.zonesVia === 'set-family') {
            doubt(it.sourceId, it.fullName, `Sklep nie podaje strefy produktu — przyjęto „${zs[0]}” z zestawu ${sets.join(', ')}, który nie wymienia składników (dopasowanie po nazwie rodziny).`);
          }
        } else {
          it.zones = [];
          it.zonesVia = null;
          doubt(it.sourceId, it.fullName, zs.length > 1
            ? `Niejednoznaczna strefa (zestawy wskazują: ${zs.join(', ')}) — zones: [].`
            : 'Sklep nie podaje strefy (brak kategorii strefy, słów w krótkim opisie i zestawu) — zones: [].');
        }
      }
    }
    // Konflikt: kategoria vs zestaw.
    const prop = propagated.get(it.sourceId) || [];
    const conflict = prop.filter((x) => !it.zones.includes(x.zone));
    if (!it.isSet && conflict.length && it.zones.length) {
      doubt(it.sourceId, it.fullName, `Zestaw ${[...new Set(conflict.map((x) => `„${x.setName}”`))].join(', ')} wskazuje strefę „${[...new Set(conflict.map((x) => x.zone))].join(', ')}”, a produkt ma „${it.zones.join(', ')}” — zostawiono ${it.zonesVia === 'category' ? 'kategorię sklepu' : 'dotychczasową'}.`);
    }
  }

  /* ---------- warianty ---------- */
  console.log('→ warianty');
  for (const it of items) {
    const p = it.raw;
    if (p.type === 'variable' && p.variations?.length) {
      const variants = [];
      for (const v of p.variations) {
        const { data: vd } = await getJson(`${API}/products/${v.id}`);
        const attr = String(vd.variation || '');
        const label =
          normalizeCapacity(/Pojemno\S*:\s*([^,]+)/i.exec(attr)?.[1]) ??
          normalizeCapacity(v.attributes?.find((a) => /pojemno/i.test(a.name))?.value);
        if (!label) doubt(it.sourceId, it.fullName, `Wariant ${v.id}: brak atrybutu „Pojemność” („${attr}”).`);
        variants.push({
          label,
          price: Number(vd.prices.price),
          regularPrice: Number(vd.prices.regular_price),
          inStock: Boolean(vd.is_in_stock),
          sourceId: vd.id,
        });
      }
      variants.sort((a, b) => (mlOf(a.label) ?? 0) - (mlOf(b.label) ?? 0));
      it.variants = variants;
      it.inStock = variants.some((v) => v.inStock);
      it.onSale = Boolean(p.on_sale);
    } else {
      const attrCap = p.attributes?.find((a) => /pojemno/i.test(a.name))?.terms?.[0]?.name;
      const label = it.isSet ? null : capacityFromName(it.fullName) ?? normalizeCapacity(attrCap);
      if (!it.isSet && !label) doubt(it.sourceId, it.fullName, 'Sklep nie podaje pojemności (ani w nazwie, ani w atrybucie) — label: null.');
      it.variants = [
        {
          label,
          price: Number(p.prices.price),
          regularPrice: Number(p.prices.regular_price),
          inStock: Boolean(p.is_in_stock),
          sourceId: p.id,
        },
      ];
    }
    const cur = p.prices.currency_code;
    if (cur !== 'PLN' || Number(p.prices.currency_minor_unit) !== 2) {
      throw new Error(`${it.fullName}: nieoczekiwana waluta ${cur}/${p.prices.currency_minor_unit}`);
    }
    if (!it.inStock) doubt(it.sourceId, it.fullName, 'W sklepie: brak na stanie (inStock: false).');
  }

  /* ---------- kolor: zachowaj wyznaczony wcześniej ---------- */
  const readJson = async (file) => {
    if (!existsSync(file)) return null;
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch {
      return null;
    }
  };
  const previous = await readJson(OUT);
  const previousMeta = await readJson(META);
  const prevColor = new Map((previous?.products || []).map((p) => [p.sourceId, p.color ?? null]));
  // colorMeta żyje w pliku skryptu; starszy format trzymał go w pigments.json.
  const prevMeta = previousMeta?.colorMeta || previous?.colorMeta || {};
  const colorMeta = {};
  let staleColors = 0;
  for (const it of items) {
    const from = it.thumbnail ? path.basename(new URL(it.thumbnail).pathname) : null;
    const meta = prevMeta[it.sourceId];
    if (meta && meta.from === from) {
      it.color = prevColor.get(it.sourceId) ?? null;
      colorMeta[it.sourceId] = meta;
    } else {
      it.color = null;
      if (meta) staleColors += 1;
      colorMeta[it.sourceId] = { from, method: 'pending' };
    }
  }

  /* ---------- miniatury do analizy (opcjonalnie, poza public/) ---------- */
  if (THUMBS) {
    await mkdir(THUMBS, { recursive: true });
    console.log(`→ miniatury do ${THUMBS}`);
    const manifest = {};
    for (const it of items) {
      if (!it.thumbnail) continue;
      const file = path.join(THUMBS, `${it.sourceId}.jpg`);
      manifest[it.sourceId] = { file: path.basename(file), from: colorMeta[it.sourceId].from, name: it.fullName, collection: it.collection };
      if (existsSync(file)) continue;
      const res = await politeFetch(it.thumbnail);
      if (!res.ok) {
        console.warn(`  ! ${it.fullName}: HTTP ${res.status}`);
        continue;
      }
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    await writeFile(path.join(THUMBS, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  /* ---------- Omnibus: słowa promocji w tekstach produktu ---------- */
  const promoHits = [];
  for (const it of items) {
    for (const [field, text] of [['nazwa', it.fullName], ['krótki opis', it.shortDesc], ['opis', it.description]]) {
      const m = PROMO_RES.map((re) => re.exec(text || '')).find(Boolean);
      if (m) {
        const at = Math.max(0, m.index - 40);
        promoHits.push(`${it.sourceId} ${it.fullName} — ${field}: „…${text.slice(at, m.index + m[0].length + 40).replace(/\s+/g, ' ')}…”`);
      }
    }
  }

  /* ---------- kolekcje ---------- */
  const collections = COLLECTIONS.map((c) => {
    const cat = need(c.slug);
    const list = items.filter((i) => i.collection === c.id);
    return {
      id: c.id,
      name: decodeEntities(cat.name).replace(/^Kolekcja\s+/i, '').trim(),
      count: list.length,
      shades: list.filter((i) => !i.isSet).length,
      sets: list.filter((i) => i.isSet).length,
      zones: sortZones(list.flatMap((i) => i.zones)),
    };
  }).filter((c) => c.count > 0);

  /* ---------- wynik ---------- */
  // Do pliku strony tylko pola, które strona pokazuje (trafia do paczki JS).
  // Cena regularna i flaga promocji → plik skryptu (META), nie do przeglądarki.
  const collOrder = COLLECTIONS.map((c) => c.id);
  const products = items
    .map((it) => ({
      id: it.id,
      sourceId: it.sourceId,
      name: it.name,
      fullName: it.fullName,
      collection: it.collection,
      series: it.series,
      isSet: it.isSet,
      zones: it.zones,
      variants: it.variants.map(({ label, price, inStock, sourceId }) => ({ label, price, inStock, sourceId })),
      shortDesc: it.shortDesc,
      description: it.description,
      inStock: it.inStock,
      color: it.color,
    }))
    .sort(
      (a, b) =>
        collOrder.indexOf(a.collection) - collOrder.indexOf(b.collection) ||
        Number(a.isSet) - Number(b.isSet) ||
        (ZONE_ORDER.indexOf(a.zones[0]) + 1 || 99) - (ZONE_ORDER.indexOf(b.zones[0]) + 1 || 99) ||
        a.name.localeCompare(b.name, 'pl', { numeric: true, sensitivity: 'base' })
    );

  // Pigmenty dołączone spoza kategorii „Pigmenty” (ZAKRES) — do zgłoszenia klientowi.
  if (extras.length) {
    doubt(null, null, `Sklep nie nadał kategorii „Pigmenty” produktom, które są w katalogu strony (ZAKRES): ${extras
      .map((p) => `${p.id} „${decodeEntities(p.name)}”`)
      .join(', ')}.`);
  }
  // Pakiety z gratisami (poza katalogiem; opisy użyte tylko do ustalenia stref składników).
  const outside = refSets.filter((p) => !itemById.has(p.id));
  if (outside.length) {
    doubt(null, null, `Poza katalogiem (pakiety z gratisami; opisy użyte tylko do ustalenia stref składników): ${outside
      .map((p) => `${p.id} „${decodeEntities(p.name)}”`)
      .join(', ')}.`);
  }
  const strays = [];
  for (const c of COLLECTIONS) {
    for (const id of membership.get(need(c.slug).id)) {
      const p = products158AndRefs.get(id);
      if (!catalogById.has(id) && !refSets.includes(p) && !strays.includes(p)) strays.push(p);
    }
  }
  if (strays.length) {
    doubt(null, null, `W kategoriach kolekcji sklepu, ale poza katalogiem (bez „Pigment” w nazwie, spoza „Sety Pigmentów”): ${strays
      .map((p) => `${p.id} „${decodeEntities(p.name)}”`)
      .join(', ')}.`);
  }

  // Wątpliwości tylko na konsoli (nie trafiają do danych strony).
  console.log(`\nWątpliwości (${doubts.length}):`);
  for (const d of doubts) console.log(`  - ${d.sourceId ?? ''}${d.name ? ` ${d.name}` : ''}: ${d.text}`);
  console.log('');

  // Plik STRONY — importowany przez src/lib/pigments.js (paczka JS przeglądarki).
  const out = {
    syncedAt,
    currency: 'PLN',
    zones: ZONES.filter((z) => products.some((p) => p.zones.includes(z.id))),
    collections,
    products,
  };

  // Plik SKRYPTU — nie importuje go kod strony.
  const meta = {
    source: `${API}/products?category=${pigCat.id} (kategoria sklepu „${decodeEntities(pigCat.name)}”) + spoza niej: ${
      extras.map((p) => p.id).join(', ') || '—'
    } (zob. ZAKRES w scripts/sync-pigments.mjs)`,
    syncedAt,
    priceNote:
      'Ceny w groszach. Strona pokazuje tylko `price` (cena bieżąca, prices.price). `regularPrice` i `onSale` są tu tylko do wiedzy — strona ich nie pokazuje (brak najniższej ceny z 30 dni, Omnibus).',
    prices: Object.fromEntries(
      items.map((it) => [
        it.sourceId,
        {
          onSale: it.onSale,
          regularPrice: Object.fromEntries(it.variants.map((v) => [v.sourceId, v.regularPrice])),
        },
      ])
    ),
    colorMeta,
  };

  const counts = {
    products: products.length,
    shades: products.filter((p) => !p.isSet).length,
    sets: products.filter((p) => p.isSet).length,
    withoutZone: products.filter((p) => !p.zones.length).length,
    withoutCollection: products.filter((p) => !p.collection).length,
    withColor: products.filter((p) => p.color).length,
    staleColors,
    doubts: doubts.length,
  };
  console.log('✓', JSON.stringify(counts));
  for (const c of collections) console.log(`  ${c.id.padEnd(26)} ${String(c.count).padStart(3)}  [${c.zones.join(', ')}]`);

  if (promoHits.length) {
    console.error(`\n✗ Omnibus: teksty produktów mówią o promocji/obniżce (${promoHits.length}):`);
    for (const h of promoHits) console.error(`  - ${h}`);
    console.error('  Strona nie pokazuje najniższej ceny z 30 dni — takich tekstów nie publikujemy.');
    console.error('  Popraw tekst w sklepie albo zdecyduj o nadpisaniu opisu, potem uruchom sync ponownie.');
    if (!DRY) {
      console.error('  Nie zapisano.');
      process.exit(1);
    }
  }

  if (DRY) {
    console.log('(--dry) nie zapisano.');
    return;
  }
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
  await writeFile(META, JSON.stringify(meta, null, 2) + '\n');
  console.log(`✓ zapisano ${path.relative(ROOT, OUT)} i ${path.relative(ROOT, META)}`);
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
