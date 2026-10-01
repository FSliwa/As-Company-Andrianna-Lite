/**
 * Nakładki tłumaczeń danych (src/content/site/{en,ru}.js) względem src/lib/site.js (node --test):
 *  - ta sama struktura (żadnego klucza ani pozycji listy, których nie ma w PL),
 *  - nakładki nie powtarzają cen (`price` liczy getSite z tekstu polskiego),
 *  - liczby w tekstach te same co w polskim oryginale (tłumaczenie nie zmienia faktów),
 *  - EN bez polskich liter, RU po rosyjsku.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as PL from '../lib/site.js';
import EN from '../content/site/en.js';
import RU from '../content/site/ru.js';
import { isPublicLocale } from './config.js';

const numbers = (s) => (String(s).match(/\d+/g) || []).sort();

/** Każdy liść nakładki: [ścieżka, tekst tłumaczenia, tekst polski]. */
function walk(over, base, path, out) {
  if (over === undefined) return out;
  if (Array.isArray(over)) {
    assert.ok(Array.isArray(base), `${path}: w PL nie ma listy`);
    assert.ok(over.length <= base.length, `${path}: więcej pozycji niż w PL (${over.length} > ${base.length})`);
    over.forEach((item, i) => walk(item, base[i], `${path}[${i}]`, out));
    return out;
  }
  if (over && typeof over === 'object') {
    assert.ok(base && typeof base === 'object' && !Array.isArray(base), `${path}: w PL nie ma obiektu`);
    for (const [key, item] of Object.entries(over)) {
      assert.notEqual(key, 'price', `${path}.price: cen nie tłumaczymy ręcznie`);
      assert.ok(Object.prototype.hasOwnProperty.call(base, key), `${path}.${key}: nie ma w PL`);
      walk(item, base[key], `${path}.${key}`, out);
    }
    return out;
  }
  assert.equal(typeof over, 'string', `${path}: tłumaczenie to nie tekst`);
  assert.equal(typeof base, 'string', `${path}: w PL to nie tekst`);
  out.push([path, over, base]);
  return out;
}

/* Teksty, które zostają bez tłumaczenia: nazwy własne, hasło marki, liczby, adresy. */
const KEEP = new Set([
  'Babushkina Academy',
  'Beauty with precision.',
  'Andriana Babushkina',
  'International PMU Trainer & Judge',
  '@andriana_babushkina',
  'Super Natural Brows',
  'Perfect Powder Brows',
  'Perfect Lips',
  'Perfect Eyeliners',
  '5×',
  '100+',
  '50+',
]);
const SKIP_KEYS = new Set(['id', 'href', 'price', 'number', 'url', 'instagram']);
const SKIP_EXPORTS = new Set(['SITE_URL', 'BOOKING_PAGE', 'BOOKING_URL', 'SHOP', 'LEGAL']);

/** Polskie teksty do przetłumaczenia: [ścieżka, tekst]. */
function translatable(value, path, out) {
  if (Array.isArray(value)) value.forEach((item, i) => translatable(item, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (!SKIP_KEYS.has(key)) translatable(item, `${path}.${key}`, out);
  } else if (typeof value === 'string' && !KEEP.has(value) && !/^\d{1,2}:\d{2}$/.test(value) && !/^https?:/.test(value)) {
    out.push([path, value]);
  }
  return out;
}
const PL_TEXTS = Object.entries(PL)
  .filter(([key]) => !SKIP_EXPORTS.has(key))
  .flatMap(([key, value]) => translatable(value, key, []));

for (const [locale, overlay] of [
  ['en', EN],
  ['ru', RU],
]) {
  const leaves = Object.entries(overlay).flatMap(([key, value]) => walk(value, PL[key], key, []));
  /* Kompletność i liczby wymagane dla języków publicznych (NEXT_PUBLIC_LOCALES). Dopóki EN/RU są
     ukryte, polski tekst może się zmieniać przed tłumaczeniem; włączenie języka bez pełnych
     tłumaczeń zatrzyma te testy. */
  const gate = isPublicLocale(locale) ? {} : { skip: `${locale} niepubliczny (NEXT_PUBLIC_LOCALES) – kompletność sprawdzana po włączeniu` };

  test(`${locale}: struktura nakładki zgodna z site.js, bez cen; każdy tekst przetłumaczony`, gate, () => {
    const done = new Set(leaves.map(([path]) => path));
    const missing = PL_TEXTS.filter(([path]) => !done.has(path)).map(([path, text]) => `${path}: ${text}`);
    assert.deepEqual(missing, [], `brak tłumaczenia (${missing.length})`);
  });

  test(`${locale}: liczby w tekstach jak w polskim oryginale`, gate, () => {
    for (const [path, text, pl] of leaves) {
      assert.deepEqual(numbers(text), numbers(pl), `${path}: „${text}” ↔ „${pl}”`);
    }
  });

  test(`${locale}: tekst w języku docelowym`, () => {
    for (const [path, text] of leaves) {
      assert.ok(!/[ąęóśłżźćńĄĘÓŚŁŻŹĆŃ]/.test(text), `${path}: polskie litery w „${text}”`);
      if (locale === 'en') assert.ok(!/[А-яЁё]/.test(text), `${path}: cyrylica w „${text}”`);
    }
    if (locale === 'ru') {
      const cyrillic = leaves.filter(([, text]) => /[А-яЁё]/.test(text)).length;
      assert.ok(cyrillic / leaves.length > 0.9, `RU: tylko ${cyrillic}/${leaves.length} tekstów po rosyjsku`);
    }
  });
}
