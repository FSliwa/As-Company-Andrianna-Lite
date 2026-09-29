/**
 * Ceny w wersjach EN/RU: liczby zawsze z danych polskich (node --test).
 * Każdy string cenowy z src/lib/site.js (+ wzorce z widoków) po lokalizacji
 * ma te same cyfry, walutę PLN i żadnego „zł”.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as SITE from '../lib/site.js';
import { getSite } from './site.js';
import { localizePriceString, formatPLN, plural } from './format.js';

const NBSP = '\u00a0';
const digits = (s) => String(s).replace(/\D/g, '');

/** Wszystkie pola `price` (tekst) w strukturze: [ścieżka, wartość]. */
function collectPrices(value, path = '', out = []) {
  if (Array.isArray(value)) value.forEach((item, i) => collectPrices(item, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'price' && typeof item === 'string') out.push([`${path}.${key}`, item]);
      else collectPrices(item, `${path}.${key}`, out);
    }
  }
  return out;
}

const SITE_PRICES = Object.entries(SITE).flatMap(([key, value]) => collectPrices(value, key));

/* Zapisy cen spoza site.js – budowane w widokach i w src/lib (pigmenty, maszynki, rezerwacja). */
const VIEW_PRICES = [
  `369${NBSP}zł${NBSP}/${NBSP}mc`, // Machines: RENTAL_PRICE
  `2${NBSP}999${NBSP}zł`, // Machines: zl(2999)
  `36,90${NBSP}zł`, // Machines: koszt na zabieg
  `369${NBSP}zł brutto`,
  `300${NBSP}zł netto`,
  'od 850 zł', // booking/config.js: priceFrom()
  `od${NBSP}149${NBSP}zł`, // pigments.js: priceFromLabel()
  `149,50${NBSP}zł`, // pigments.js: formatPrice() z groszami
  `6${NBSP}ml${NBSP}149${NBSP}zł · 15${NBSP}ml${NBSP}219${NBSP}zł`, // pigments.js: priceLabel()
  `7${NBSP}000${NBSP}zł${NBSP}netto`, // Education: priceLabel()
  `od${NBSP}500${NBSP}zł`, // Treatments: fmt('> 500 zł')
];

test('site.js ma ceny do sprawdzenia', () => {
  assert.ok(SITE_PRICES.length >= 15, `znaleziono tylko ${SITE_PRICES.length} cen`);
});

for (const locale of ['en', 'ru']) {
  test(`${locale}: każda cena z site.js i widoków – te same cyfry, PLN, bez „zł”`, () => {
    for (const [where, pl] of [...SITE_PRICES, ...VIEW_PRICES.map((p) => ['widok', p])]) {
      const out = localizePriceString(pl, locale);
      assert.notEqual(out, pl, `${where}: „${pl}” nie został rozpoznany`);
      assert.equal(digits(out), digits(pl), `${where}: „${pl}” → „${out}” – zmieniły się cyfry`);
      assert.ok(out.includes('PLN') && !out.includes('zł'), `${where}: „${out}”`);
    }
  });

  test(`${locale}: getSite() podaje zlokalizowane ceny z tymi samymi cyframi co PL`, () => {
    const localized = Object.entries(getSite(locale)).flatMap(([key, value]) => collectPrices(value, key));
    assert.equal(localized.length, SITE_PRICES.length);
    localized.forEach(([where, value], i) => {
      assert.equal(where, SITE_PRICES[i][0]);
      assert.equal(digits(value), digits(SITE_PRICES[i][1]), `${where}: „${value}”`);
      assert.ok(!value.includes('zł'), `${where}: „${value}”`);
    });
  });
}

test('zapis jak w I18N_SPEC §5', () => {
  const cases = [
    ['1700 zł', '1,700 PLN', `1${NBSP}700 PLN`],
    ['od 850 zł', 'from 850 PLN', 'от 850 PLN'],
    ['7 000 zł netto', '7,000 PLN net', `7${NBSP}000 PLN нетто`],
    ['369 zł / mc', '369 PLN / month', '369 PLN / мес.'],
    ['> 500 zł', '> 500 PLN', '> 500 PLN'],
    ['36,90 zł', '36.90 PLN', '36,90 PLN'],
    ['15 000 zł', '15,000 PLN', `15${NBSP}000 PLN`],
    ['6 ml 149 zł · 15 ml 219 zł', '6 ml 149 PLN · 15 ml 219 PLN', '6 мл 149 PLN · 15 мл 219 PLN'],
  ];
  for (const [pl, en, ru] of cases) {
    assert.equal(localizePriceString(pl, 'en'), en);
    assert.equal(localizePriceString(pl, 'ru'), ru);
  }
});

test('twarde spacje z oryginału zostają twarde', () => {
  assert.equal(localizePriceString(`369${NBSP}zł${NBSP}/${NBSP}mc`, 'en'), `369${NBSP}PLN${NBSP}/${NBSP}month`);
});

test('polski, liczba bez waluty i nieznany zapis – bez zmian', () => {
  assert.equal(localizePriceString('1700 zł', 'pl'), '1700 zł');
  assert.equal(localizePriceString('10', 'en'), '10');
  assert.equal(localizePriceString(null, 'en'), null);
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.equal(localizePriceString('2,1–3,0 mm', 'en'), '2,1–3,0 mm');
    assert.equal(localizePriceString('cena do ustalenia zł', 'ru'), 'cena do ustalenia zł');
  } finally {
    console.warn = warn;
  }
});

test('formatPLN i plural', () => {
  assert.equal(formatPLN(1700, 'pl'), '1700 zł');
  assert.equal(formatPLN(1700, 'en'), '1,700 PLN');
  assert.equal(plural('ru', 21, { one: 'оттенок', few: 'оттенка', many: 'оттенков' }), 'оттенок');
  assert.equal(plural('ru', 3, { one: 'оттенок', few: 'оттенка', many: 'оттенков' }), 'оттенка');
  assert.equal(plural('en', 1, { one: 'shade', other: 'shades' }), 'shade');
});
