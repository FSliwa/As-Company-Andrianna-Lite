/**
 * Dokumenty prawne i baner cookies (node --test):
 *  - teksty banera (banner.js) = pole "banner" w cookies.<język>.json,
 *  - te same sekcje (id) i ten sam układ bloków w wersjach PL, EN i RU,
 *  - składnia treści (segmenty [[…]], listy {{…}}, znaczniki {pole}) – tokenize,
 *  - każdy akapit i punkt 9 dokumentów w wariancie „brak danych firmy” (dziś) i „pełne dane
 *    testowe” – oraz we wszystkich kombinacjach częściowych – czyta się bez śladów znaczników,
 *    „[do uzupełnienia]”, pustych nawiasów, podwójnych przecinków i urwanych zdań,
 *  - bez danych: marka, miasto i Instagram; z danymi: wszystkie dane firmy, bez wartości zastępczych,
 *  - klauzula pod formularzami (noticeController) – te same zasady,
 *  - liczby z Regulaminu (pkt 9) = konfiguracja rezerwacji (BOOKING_CONFIG),
 *  - publikacja: LEGAL_PUBLIC (decyzja Filipa z 30.09.2026) otwiera dokumenty, klauzule i bramki;
 *    bez niego rezerwacja jest wyłączona,
 *  - consent.js: wygaśnięcie po 12 miesiącach, inna wersja, znacznik z przyszłości, uszkodzony wpis.
 */
import { readFileSync } from 'node:fs';
import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import BANNER from '../content/legal/banner.js';
import COMMON_PL from '../content/common/pl.js';
import COMMON_EN from '../content/common/en.js';
import COMMON_RU from '../content/common/ru.js';
import { getSite } from '../i18n/site.js';
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
  LEGAL_FALLBACKS,
  LEGAL_PUBLIC,
  LEGAL_PUBLISHED,
  LEGAL_VALUES,
  PUBLIC_BEFORE_COMPANY_DATA,
  REQUIRED,
  fallbackCompanyName,
  isBlank,
  missingFields,
  parseLegalText,
  partsToText,
  tokenize,
} from './legal.js';
import { CONTACT } from './site.js';

const LOCALES = ['pl', 'en', 'ru'];
const DOCS = ['privacy', 'cookies', 'terms'];
const COMMON = { pl: COMMON_PL, en: COMMON_EN, ru: COMMON_RU };
const load = (doc, locale) =>
  JSON.parse(readFileSync(new URL(`../content/legal/${doc}.${locale}.json`, import.meta.url), 'utf8'));

/* ---------------- warianty danych ---------------- */

/** Dane firmy, które mogą być puste (reszta – instagram, siteUrl – jest zawsze). */
const COMPANY_FIELDS = ['company', 'address', 'nip', 'register', 'email', 'phone', 'ownPrivacyEmail', 'street'];

const TEST_DATA = {
  company: 'Testowa Firma sp. z o.o.',
  address: 'ul. Testowa 1, 00-001 Warszawa',
  nip: '5250000000',
  register: 'KRS 0000000000',
  email: 'kontakt@example.pl',
  phone: '+48 500 000 000',
  ownPrivacyEmail: 'dane@example.pl',
  street: 'ul. Testowa 1',
};

/** Wartości dla tokenize z podzbioru uzupełnionych pól (jak LEGAL_VALUES w legal.js). */
function valuesWith(filled) {
  const pick = (key) => (filled.includes(key) ? TEST_DATA[key] : null);
  return {
    ...LEGAL_VALUES,
    company: pick('company'),
    seat: pick('address'),
    address: pick('address'),
    nip: pick('nip'),
    register: pick('register'),
    privacyEmail: pick('ownPrivacyEmail') || pick('email'),
    email: pick('email'),
    phone: pick('phone'),
    street: pick('street'),
  };
}

const NONE = valuesWith([]);
const FULL = valuesWith(COMPANY_FIELDS);

/* ---------------- render jak w LegalDocument ---------------- */

/** Wszystkie teksty dokumentu: [miejsce, tekst, rodzaj]. */
function blocks(doc) {
  const out = [['title', doc.title, 'title']];
  if (doc.intro) out.push(['intro', doc.intro, 'p']);
  for (const s of doc.sections) {
    out.push([`${s.id}`, s.heading, 'heading']);
    s.blocks.forEach((b, i) => {
      if (b.p) out.push([`${s.id}#${i}`, b.p, 'p']);
      if (b.h3) out.push([`${s.id}#${i}`, b.h3, 'h3']);
      if (b.list) b.list.forEach((item, j) => out.push([`${s.id}#${i}.${j}`, item, 'li']));
    });
  }
  return out;
}

/** Dokument po wyrenderowaniu: teksty bez pustych akapitów i pozycji list (jak LegalDocument). */
function render(doc, locale, values, publicMode = true) {
  return blocks(doc)
    .map(([where, text, kind]) => {
      const parts = tokenize(text, { values, locale, publicMode });
      return { where, kind, parts, text: partsToText(parts), blank: isBlank(parts) };
    })
    .filter((b) => !b.blank);
}

/** Usterki w wyrenderowanym tekście – każda z nazwą, żeby komunikat błędu mówił, co poprawić. */
const DEFECTS = [
  ['znacznik {…}', /[{}]/],
  ['segment [[…]]', /\[\[|\]\]/],
  ['kreska listy |', /\|/],
  ['„do uzupełnienia”', /do uzupełnienia|to be completed|будет дополнено/i],
  // „plik .ics” to nie usterka – znak interpunkcyjny musi kończyć słowo
  ['spacja przed znakiem interpunkcyjnym', / [,.;:!?)](\s|$)/],
  // „sp. z o.o., ul. …” to nie usterka – kropka skrótu przed przecinkiem jest dozwolona
  ['podwójny znak interpunkcyjny', /,,|;;|::|\.\.(?!\.)|,\.|,;|;\.|,:/],
  ['przecinek przed kropką/nawiasem', /,\s+[.;:)]/],
  ['pusty nawias', /\(\s*\)/],
  ['spacja po „(”', /\(\s/],
  ['podwójna spacja', / {2}/],
  ['spacja na początku/końcu', /^\s|\s$/],
  ['dwukropek przed kropką', /:\s*[.;,]/],
  ['urwane „na adres”/„pod numer”', /(^|\s)(na adres|pod numer|z adresem|tel\.|addressed to|write to|at|by post at|by email to|на адрес|по адресу|с адресом|тел\.)\s*[.,;)]/i],
  // „and, in addition:” ani „i.e.” to nie usterki – urwany spójnik stoi przed końcem zdania, średnikiem albo nawiasem
  ['urwany spójnik', /(^|\s)(albo|lub|oraz|i|or|and|или|и)\s*[.;)](\s|$)/i],
  ['nawias zaczęty spójnikiem', /\(\s*(albo|lub|or|или)\b/i],
  ['„NIP” bez numeru', /NIP\s*[,.;]/],
];

function defectsOf(text) {
  return DEFECTS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

function assertClean(rendered, label) {
  for (const b of rendered) {
    const found = defectsOf(b.text);
    assert.deepEqual(found, [], `${label} [${b.where}]: ${found.join(', ')} w „${b.text.slice(0, 200)}”`);
    const missing = b.parts.filter((p) => p.missing);
    assert.deepEqual(missing, [], `${label} [${b.where}]: pole bez wartości poza segmentem: ${missing.map((p) => p.field).join(', ')}`);
  }
}

/* ---------------- testy ---------------- */

describe('dokumenty prawne – struktura', () => {
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

  test('znaczniki: znane pola; poza segmentem/listą tylko pola z wartością zawsze (marka, miasto, Instagram, adres serwisu)', () => {
    assert.ok(CONTACT.instagram && CONTACT.instagramHandle, 'CONTACT.instagram jest kanałem kontaktu bez danych firmy');
    const ALWAYS = new Set(['company', 'seat', 'instagram', 'siteUrl']);
    const walk = (nodes, guarded, where) => {
      for (const node of nodes) {
        if (node.type === 'field') {
          assert.ok(node.field in LEGAL_VALUES, `${where}: nieznany znacznik {${node.field}}`);
          if (!guarded && !(node.field === 'siteUrl' && node.path))
            assert.ok(ALWAYS.has(node.field), `${where}: {${node.field}} poza segmentem [[…]] – bez danych zostałoby urwane zdanie`);
        } else if (node.type === 'segment') walk(node.nodes, true, where);
        else if (node.type === 'list') {
          assert.ok(node.items.length >= 2, `${where}: lista {{…}} z jedną pozycją – wystarczy segment`);
          node.items.forEach((item) => walk(item, true, where));
        }
      }
    };
    const texts = [];
    for (const doc of DOCS)
      for (const locale of LOCALES) for (const [where, text] of blocks(load(doc, locale))) texts.push([`${doc}.${locale} ${where}`, text]);
    for (const locale of LOCALES) texts.push([`common.${locale} noticeController`, COMMON[locale].noticeController]);
    for (const [where, text] of texts) walk(parseLegalText(text), false, where);
  });
});

describe('dokumenty prawne – render bez danych i z danymi', () => {
  test('bez danych firmy (dziś): czyste zdania, marka + miasto + Instagram, bez NIP-u, e-maila i telefonu', () => {
    for (const doc of DOCS)
      for (const locale of LOCALES) {
        const rendered = render(load(doc, locale), locale, NONE);
        assertClean(rendered, `${doc}.${locale} (brak danych)`);
        const all = rendered.map((b) => b.text).join('\n');
        const { company, seat } = LEGAL_FALLBACKS[locale];
        // marka stoi też w zwykłym tekście („pod marką …”) – sprawdzamy samo pole {company}
        const hasBrand = rendered.flatMap((b) => b.parts).some((p) => p.field === 'company' && p.fallback && p.value === company);
        assert.ok(hasBrand, `${doc}.${locale}: brak marki w miejscu nazwy firmy`);
        assert.ok(all.includes(seat), `${doc}.${locale}: brak miasta w miejscu siedziby`);
        assert.ok(all.includes(CONTACT.instagramHandle), `${doc}.${locale}: brak Instagrama jako kanału kontaktu`);
        assert.doesNotMatch(all, /\bNIP\b|Tax ID|ИНН|KRS 0|@example/, `${doc}.${locale}: dane firmy w wariancie bez danych`);
        for (const b of rendered) if (b.kind === 'li') assert.ok(b.text.trim(), `${doc}.${locale} [${b.where}]: pusta pozycja listy`);
      }
  });

  test('każda lista zachowuje co najmniej jedną pozycję bez danych firmy', () => {
    for (const doc of DOCS)
      for (const locale of LOCALES)
        for (const s of load(doc, locale).sections)
          s.blocks.forEach((b, i) => {
            if (!b.list) return;
            const kept = b.list.filter((item) => !isBlank(tokenize(item, { values: NONE, locale, publicMode: true })));
            assert.ok(kept.length > 0, `${doc}.${locale} [${s.id}#${i}]: lista bez żadnej pozycji`);
          });
  });

  test('pełne dane testowe: czyste zdania, wszystkie dane firmy, żadnej wartości zastępczej', () => {
    const expected = ['company', 'address', 'nip', 'register', 'email', 'phone', 'ownPrivacyEmail'].map((k) => TEST_DATA[k]);
    for (const doc of DOCS)
      for (const locale of LOCALES) {
        const rendered = render(load(doc, locale), locale, FULL);
        assertClean(rendered, `${doc}.${locale} (pełne dane)`);
        const all = rendered.map((b) => b.text).join('\n');
        for (const value of expected) assert.ok(all.includes(value), `${doc}.${locale}: w pełnym wariancie brak „${value}”`);
        const fallback = rendered.flatMap((b) => b.parts).filter((p) => p.fallback);
        assert.deepEqual(fallback, [], `${doc}.${locale}: wartość zastępcza mimo pełnych danych`);
        assert.ok(all.includes(CONTACT.instagramHandle), `${doc}.${locale}: Instagram zostaje kanałem kontaktu`);
      }
  });

  test('każda kombinacja częściowo uzupełnionych danych daje czyste zdania', () => {
    const combos = 1 << COMPANY_FIELDS.length;
    for (let mask = 0; mask < combos; mask += 1) {
      const filled = COMPANY_FIELDS.filter((_, bit) => mask & (1 << bit));
      const values = valuesWith(filled);
      for (const doc of DOCS)
        for (const locale of LOCALES) assertClean(render(load(doc, locale), locale, values), `${doc}.${locale} [${filled.join('+') || 'nic'}]`);
    }
  });

  test('tryb projektu (LEGAL_PUBLIC = false) pokazuje braki zamiast wartości zastępczych', () => {
    const rendered = render(load('privacy', 'pl'), 'pl', NONE, false);
    const all = rendered.map((b) => b.text).join('\n');
    assert.match(all, /\[do uzupełnienia: nazwa firmy\]/);
    assert.match(all, /\[do uzupełnienia: NIP\]/);
    const fallback = rendered.flatMap((b) => b.parts).filter((p) => p.fallback);
    assert.deepEqual(fallback, [], 'w trybie projektu bez marki w miejscu nazwy firmy');
  });
});

describe('klauzula pod formularzami (noticeController)', () => {
  test('bez danych: marka, miasto i Instagram; z danymi: nazwa, adres i e-mail', () => {
    for (const locale of LOCALES) {
      const text = COMMON[locale].noticeController;
      const none = [{ where: 'noticeController', parts: tokenize(text, { values: NONE, locale, publicMode: true }) }];
      none[0].text = partsToText(none[0].parts);
      assertClean(none, `common.${locale} (brak danych)`);
      const { company, seat } = LEGAL_FALLBACKS[locale];
      assert.ok(none[0].text.includes(`${company}, ${seat}`), `common.${locale}: „${none[0].text}”`);
      assert.ok(none[0].text.includes(CONTACT.instagramHandle), `common.${locale}: brak Instagrama`);

      const full = [{ where: 'noticeController', parts: tokenize(text, { values: FULL, locale, publicMode: true }) }];
      full[0].text = partsToText(full[0].parts);
      assertClean(full, `common.${locale} (pełne dane)`);
      for (const value of [TEST_DATA.company, TEST_DATA.address, TEST_DATA.ownPrivacyEmail])
        assert.ok(full[0].text.includes(value), `common.${locale}: brak „${value}” w „${full[0].text}”`);
    }
  });
});

describe('tokenize – składnia', () => {
  const values = { company: null, seat: null, address: null, nip: null, email: 'a@b.pl', phone: null, instagram: 'https://ig/x', siteUrl: 'https://example.pl' };
  const text = (t, opts = {}) => partsToText(tokenize(t, { values, publicMode: true, ...opts }));

  test('link do podstrony, kropka po ścieżce, nieznany znacznik', () => {
    assert.deepEqual(tokenize('Zobacz {siteUrl}/regulamin#rezerwacja-online.', { values }), [
      { text: 'Zobacz ' },
      { link: '/regulamin#rezerwacja-online' },
      { text: '.' },
    ]);
    assert.deepEqual(tokenize('adres {siteUrl}', { values }), [{ text: 'adres ' }, { field: 'siteUrl', value: 'https://example.pl' }]);
    assert.deepEqual(tokenize('{nieznane} zostaje', { values }), [{ text: '{nieznane} zostaje' }]);
  });

  test('wartości zastępcze (marka, miasto w języku strony) tylko przy LEGAL_PUBLIC', () => {
    assert.equal(text('Administrator: {company}, {seat}[[, NIP {nip}]].', { locale: 'en' }), `Administrator: ${LEGAL_FALLBACKS.en.company}, Warsaw.`);
    assert.equal(text('{seat}', { locale: 'ru' }), 'Варшава');
    const draft = tokenize('{company}[[, NIP {nip}]]', { values, publicMode: false });
    assert.deepEqual(draft, [{ field: 'company', missing: true }, { text: ', NIP ' }, { field: 'nip', missing: true }]);
    const withFallback = tokenize('{company}', { values });
    assert.deepEqual(withFallback, [{ field: 'company', value: LEGAL_FALLBACKS.pl.company, fallback: true }]);
  });

  test('segmenty: znikają bez danych, zagnieżdżone liczą się osobno', () => {
    assert.equal(text('Napisz[[ na adres {email} albo]] na Instagramie.'), 'Napisz na adres a@b.pl albo na Instagramie.');
    assert.equal(text('Napisz[[ tel. {phone} albo]] na Instagramie.'), 'Napisz na Instagramie.');
    assert.equal(text('A[[ – {email}[[, tel. {phone}]]]].'), 'A – a@b.pl.');
    assert.equal(text('A[[ – {phone}[[, {email}]]]].'), 'A.');
    assert.equal(text('X[[{?email}; ok]][[{?phone}; nie]].'), 'X; ok.');
    assert.equal(text('[[NIP: {nip}]]'), '');
    assert.ok(isBlank(tokenize('[[NIP: {nip}]]', { values })));
  });

  test('listy {{…}}: spójnik przed ostatnią pozycją, pusty spójnik = przecinki, pusta lista jak brak pola', () => {
    const list = '{{lub|{?phone}telefonicznie|{?email}e-mailem|przez Instagram}}';
    assert.equal(text(`Umów się ${list}.`), 'Umów się e-mailem lub przez Instagram.');
    assert.equal(text(`Umów się ${list}.`, { values: { ...values, email: null } }), 'Umów się przez Instagram.');
    assert.equal(text(`Umów się ${list}.`, { values: { ...values, phone: '1' } }), 'Umów się telefonicznie, e-mailem lub przez Instagram.');
    assert.equal(text('Dane: {{|{email}|tel. {phone}}}.', { values: { ...values, phone: '1' } }), 'Dane: a@b.pl, tel. 1.');
    assert.equal(text('A.[[ Też: {{|{phone}|{nip}}}.]]'), 'A.');
    const empty = tokenize('Też: {{lub|{phone}|{nip}}}.', { values });
    assert.ok(empty.some((p) => p.missing), 'lista bez pozycji poza segmentem = błąd treści');
  });

  test('niezamknięte i nadmiarowe nawiasy to błąd', () => {
    for (const bad of ['[[ bez końca', 'lista {{lub|a|b', 'koniec ]] bez początku', 'koniec }} bez początku', 'lista {{bez kreski}}'])
      assert.throws(() => tokenize(bad, { values }), /Dokument prawny/, bad);
  });
});

describe('dokumenty prawne – liczby z konfiguracji', () => {
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
  test('decyzja Filipa (30.09.2026): dokumenty publiczne przed uzupełnieniem danych firmy', () => {
    assert.equal(PUBLIC_BEFORE_COMPANY_DATA, true);
    assert.equal(LEGAL_PUBLIC, PUBLIC_BEFORE_COMPANY_DATA || LEGAL_PUBLISHED);
    assert.equal(LEGAL_PUBLIC, true);
  });

  test('pełne obowiązywanie (LEGAL_PUBLISHED) wymaga danych firmy i daty zatwierdzenia', () => {
    assert.equal(LEGAL_PUBLISHED, LEGAL_COMPLETE && LEGAL_APPROVED);
    if (!LEGAL_APPROVED) assert.equal(LEGAL_PUBLISHED, false);
    assert.deepEqual(missingFields(valuesWith(COMPANY_FIELDS)), []);
    assert.deepEqual(missingFields(NONE), REQUIRED);
  });

  test('wartości zastępcze tylko z site.js: marka i miasto; nic za e-mail, telefon, NIP ani adres', () => {
    for (const locale of LOCALES) {
      const { BRAND, CONTACT: C } = getSite(locale);
      const company = BRAND.academy && BRAND.academy !== BRAND.full ? `${BRAND.full} (${BRAND.academy})` : BRAND.full;
      assert.deepEqual(LEGAL_FALLBACKS[locale], { company, seat: C.city });
      assert.ok(!LEGAL_FALLBACKS[locale].company.includes(`(${BRAND.full})`), `${locale}: marka powtórzona w nawiasie`);
    }
  });

  test('marka w miejscu nazwy firmy: nawias z akademią tylko przy innej nazwie', () => {
    assert.equal(fallbackCompanyName({ full: 'Babushkina Academy', academy: 'Babushkina Academy' }), 'Babushkina Academy');
    assert.equal(fallbackCompanyName({ full: 'Babushkina Academy' }), 'Babushkina Academy');
    assert.equal(fallbackCompanyName({ full: 'Salon', academy: 'Akademia' }), 'Salon (Akademia)');
  });

  test('rezerwacja: bez publicznych dokumentów domyślny dostawca = null (API → 503 disabled)', async () => {
    const env = { NODE_ENV: 'test', BOOKING_PROVIDER: 'memory' };
    assert.equal(defaultProvider(env, { legalPublic: false }), null);
    assert.notEqual(defaultProvider(env, { legalPublic: true }), null);
    if (LEGAL_PUBLIC) {
      assert.notEqual(defaultProvider(env), null, 'LEGAL_PUBLIC: rezerwacja zależy już tylko od konfiguracji kalendarza');
      assert.equal(defaultProvider({ NODE_ENV: 'production' }), null, 'bez kluczy Google rezerwacja pozostaje wyłączona');
    } else {
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
