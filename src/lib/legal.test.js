/**
 * Dokumenty prawne i baner cookies (node --test):
 *  - teksty banera (banner.js) = pole "banner" w cookies.<język>.json,
 *  - te same sekcje (id) i ten sam układ bloków w wersjach PL, EN i RU,
 *  - każdy znacznik {pole} z dokumentów jest w REQUIRED albo ma wartość zawsze –
 *    po uzupełnieniu REQUIRED żaden dokument nie pokazuje „[do uzupełnienia]”,
 *  - tokenize: link {siteUrl}/ścieżka, nieznany znacznik, kropka po ścieżce,
 *  - liczby z Regulaminu (pkt 9) = konfiguracja rezerwacji (BOOKING_CONFIG),
 *  - publikacja: bez danych i bez zatwierdzenia dokumentów rezerwacja i formularze są wyłączone,
 *  - consent.js: wygaśnięcie po 12 miesiącach, inna wersja, znacznik z przyszłości, uszkodzony wpis.
 */
import { readFileSync } from 'node:fs';
import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import BANNER from '../content/legal/banner.js';
import { BOOKING_CONFIG } from './booking/config.js';
import { defaultProvider, handleBookingPost } from './booking/handlers.js';
import {
  CONSENT_KEY,
  CONSENT_MAX_AGE_MS,
  CONSENT_VERSION,
  readConsent,
  writeConsent,
} from './consent.js';
import {
  LEGAL_APPROVED,
  LEGAL_COMPLETE,
  LEGAL_PUBLISHED,
  LEGAL_VALUES,
  REQUIRED,
  missingFields,
  tokenize,
} from './legal.js';

const LOCALES = ['pl', 'en', 'ru'];
const DOCS = ['privacy', 'cookies', 'terms'];
const load = (doc, locale) =>
  JSON.parse(readFileSync(new URL(`../content/legal/${doc}.${locale}.json`, import.meta.url), 'utf8'));

/** Wszystkie teksty dokumentu, które renderuje LegalDocument (bez decyzji). */
function renderedTexts(doc) {
  const out = [doc.intro || ''];
  for (const s of doc.sections) {
    out.push(s.heading);
    for (const b of s.blocks) {
      if (b.p) out.push(b.p);
      if (b.h3) out.push(b.h3);
      if (b.list) out.push(...b.list);
    }
  }
  return out;
}

/** Pola, które mają wartość zawsze (privacyEmail → zastępczo email). */
const ALWAYS = new Set(['privacyEmail', 'instagram', 'siteUrl']);

describe('dokumenty prawne', () => {
  test('banner.js jest kopią pola "banner" z cookies.<język>.json', () => {
    for (const locale of LOCALES) {
      assert.deepEqual(BANNER[locale], load('cookies', locale).banner, `banner.js ≠ cookies.${locale}.json → banner`);
    }
  });

  test('PL, EN i RU mają te same sekcje i ten sam układ bloków', () => {
    const shape = (doc) =>
      doc.sections.map((s) => `${s.id}:${s.blocks.map((b) => (b.list ? `list${b.list.length}` : b.h3 ? 'h3' : 'p')).join(',')}`);
    for (const doc of DOCS) {
      const pl = load(doc, 'pl');
      for (const locale of ['en', 'ru']) {
        const tr = load(doc, locale);
        assert.deepEqual(shape(tr), shape(pl), `${doc}.${locale}.json: inne sekcje/bloki niż w wersji polskiej`);
        assert.equal(tr.decisions.length, pl.decisions.length, `${doc}.${locale}.json: inna liczba decyzji`);
        assert.equal(tr.updated, pl.updated, `${doc}.${locale}.json: inna data aktualizacji`);
        assert.equal(tr.effective ?? null, pl.effective ?? null, `${doc}.${locale}.json: inna data wejścia w życie`);
      }
    }
  });

  test('każdy znacznik z dokumentów jest w REQUIRED albo ma wartość zawsze', () => {
    const used = new Set();
    for (const doc of DOCS)
      for (const locale of LOCALES)
        for (const text of renderedTexts(load(doc, locale)))
          for (const [, field] of text.matchAll(/\{([a-zA-Z]+)\}/g)) used.add(field);
    for (const field of used) {
      assert.ok(field in LEGAL_VALUES, `nieznany znacznik {${field}}`);
      assert.ok(REQUIRED.includes(field) || ALWAYS.has(field), `{${field}} nie jest w REQUIRED (src/lib/legal.js)`);
    }
  });

  test('po uzupełnieniu REQUIRED żaden dokument nie ma braków', () => {
    const filled = { ...LEGAL_VALUES };
    for (const key of REQUIRED) filled[key] = `test-${key}`;
    filled.privacyEmail = filled.privacyEmail || filled.email;
    assert.deepEqual(missingFields(filled), []);
    for (const doc of DOCS)
      for (const locale of LOCALES)
        for (const text of renderedTexts(load(doc, locale))) {
          const missing = tokenize(text, filled).filter((p) => p.missing);
          assert.deepEqual(missing, [], `${doc}.${locale}: brak w „${text.slice(0, 60)}…”`);
        }
  });

  test('tokenize: link do podstrony, nieznany znacznik, kropka po ścieżce', () => {
    const values = { siteUrl: 'https://example.pl', email: 'a@b.pl', phone: null };
    assert.deepEqual(tokenize('Zobacz {siteUrl}/regulamin#rezerwacja-online.', values), [
      { text: 'Zobacz ' },
      { link: '/regulamin#rezerwacja-online' },
      { text: '.' },
    ]);
    assert.deepEqual(tokenize('Napisz: {email}, tel. {phone}', values), [
      { text: 'Napisz: ' },
      { field: 'email', value: 'a@b.pl' },
      { text: ', tel. ' },
      { field: 'phone', missing: true },
    ]);
    assert.deepEqual(tokenize('{nieznane} zostaje', values), [{ text: '{nieznane}' }, { text: ' zostaje' }]);
    assert.deepEqual(tokenize('adres {siteUrl}', values), [{ text: 'adres ' }, { field: 'siteUrl', value: 'https://example.pl' }]);
  });

  test('Regulamin (pkt 9) podaje te same liczby co konfiguracja rezerwacji', () => {
    const { minLeadHours, maxDaysAhead } = BOOKING_CONFIG;
    const active = BOOKING_CONFIG.abuse.maxActivePerContact;
    const WORDS = { 2: { pl: 'dwie', en: 'two', ru: 'двух' } };
    assert.ok(WORDS[active], `maxActivePerContact = ${active}: zmień pkt 9 Regulaminu (PL/EN/RU) i ten test`);
    for (const locale of LOCALES) {
      const section = load('terms', locale).sections.find((s) => s.id === 'rezerwacja-online');
      const text = section.blocks.map((b) => b.p || (b.list || []).join(' ')).join(' ');
      assert.match(text, new RegExp(`\\b${minLeadHours}\\b`), `terms.${locale}: brak ${minLeadHours} h (minLeadHours)`);
      assert.match(text, new RegExp(`\\b${maxDaysAhead}\\b`), `terms.${locale}: brak ${maxDaysAhead} dni (maxDaysAhead)`);
      assert.ok(text.includes(WORDS[active][locale]), `terms.${locale}: brak „${WORDS[active][locale]}” (maxActivePerContact)`);
    }
  });
});

describe('publikacja dokumentów', () => {
  test('bez daty zatwierdzenia dokumenty nie obowiązują', () => {
    assert.equal(LEGAL_PUBLISHED, LEGAL_COMPLETE && LEGAL_APPROVED);
    if (!LEGAL_APPROVED) assert.equal(LEGAL_PUBLISHED, false);
  });

  test('rezerwacja: bez obowiązujących dokumentów domyślny dostawca = null (API → 503 disabled)', async () => {
    const env = { NODE_ENV: 'test', BOOKING_PROVIDER: 'memory' };
    assert.equal(defaultProvider(env, { legalPublished: false }), null);
    assert.notEqual(defaultProvider(env, { legalPublished: true }), null);
    if (!LEGAL_PUBLISHED) {
      const res = await handleBookingPost(
        new Request('http://localhost:3000/api/booking', {
          method: 'POST',
          headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/json' },
          body: '{}',
        }),
        { env }
      );
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), { error: 'disabled' });
    }
  });
});

describe('consent.js', () => {
  const store = new Map();
  globalThis.window = globalThis.window || {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    dispatchEvent: () => true,
  };
  const put = (value) => window.localStorage.setItem(CONSENT_KEY, typeof value === 'string' ? value : JSON.stringify(value));
  afterEach(() => store.clear());

  test('świeża decyzja jest ważna', () => {
    const data = writeConsent({});
    assert.equal(data.v, CONSENT_VERSION);
    assert.equal(data.necessary, true);
    assert.deepEqual(readConsent(), data);
  });

  test('decyzja wygasa po 12 miesiącach', () => {
    put({ v: CONSENT_VERSION, ts: Date.now() - CONSENT_MAX_AGE_MS - 1000, necessary: true });
    assert.equal(readConsent(), null);
  });

  test('inna wersja, znacznik z przyszłości, brak ts, uszkodzony wpis → baner od nowa', () => {
    for (const bad of [
      { v: CONSENT_VERSION + 1, ts: Date.now(), necessary: true },
      { v: CONSENT_VERSION, ts: Date.now() + 5 * 365 * 24 * 3600 * 1000, necessary: true },
      { v: CONSENT_VERSION, necessary: true },
      '{uszkodzony',
      'null',
      '[1,2]',
    ]) {
      put(bad);
      assert.equal(readConsent(), null, JSON.stringify(bad));
    }
  });
});
