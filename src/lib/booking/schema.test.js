import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingSchema, issueFields, parseSlotsQuery } from './schema.js';

const valid = {
  treatment: 'perfect-lips',
  date: '2026-10-26',
  time: '12:30',
  name: '  Anna   Kowalska-Nowak ',
  phone: '+48 600 700 800',
  email: ' anna@example.com ',
  note: 'Pierwsza wizyta.\r\nProszę o kontakt SMS.',
  website: '',
  formToken: 'kxyz.0123456789abcdef0123456789abcdef',
};

const fieldsOf = (data) => {
  const r = bookingSchema.safeParse(data);
  return r.success ? [] : issueFields(r.error);
};

describe('bookingSchema', () => {
  test('poprawne dane → oczyszczone wartości', () => {
    const r = bookingSchema.safeParse(valid);
    assert.equal(r.success, true);
    assert.equal(r.data.name, 'Anna Kowalska-Nowak');
    assert.equal(r.data.email, 'anna@example.com');
    assert.equal(r.data.note, 'Pierwsza wizyta.\nProszę o kontakt SMS.');
  });
  test('note opcjonalne (brak lub null → ""), website może być null', () => {
    const rest = { ...valid };
    delete rest.note;
    const r = bookingSchema.safeParse(rest);
    assert.equal(r.success, true);
    assert.equal(r.data.note, '');
    const n = bookingSchema.safeParse({ ...valid, note: null, website: null });
    assert.equal(n.success, true);
    assert.equal(n.data.note, '');
  });
  test('imię: 2–80 znaków, litery (także diakrytyki, apostrof)', () => {
    assert.deepEqual(fieldsOf({ ...valid, name: 'Łucja D’Arc' }), []);
    assert.deepEqual(fieldsOf({ ...valid, name: 'A' }), ['name']);
    assert.deepEqual(fieldsOf({ ...valid, name: 'A'.repeat(81) }), ['name']);
    assert.deepEqual(fieldsOf({ ...valid, name: '<script>' }), ['name']);
    assert.deepEqual(fieldsOf({ ...valid, name: 'Anna\u0000' }), []);
  });
  test('telefon: cyfry/spacje/+, 9–15 cyfr', () => {
    assert.deepEqual(fieldsOf({ ...valid, phone: '600700800' }), []);
    assert.deepEqual(fieldsOf({ ...valid, phone: '600-700-800' }), []);
    assert.deepEqual(fieldsOf({ ...valid, phone: '+380 44 123 45 67' }), []);
    assert.deepEqual(fieldsOf({ ...valid, phone: '60070080' }), ['phone']);
    assert.deepEqual(fieldsOf({ ...valid, phone: '1234567890123456' }), ['phone']);
    assert.deepEqual(fieldsOf({ ...valid, phone: '600 700 800 ext 1' }), ['phone']);
    assert.deepEqual(fieldsOf({ ...valid, phone: '600+700800' }), ['phone']);
  });
  test('e-mail', () => {
    assert.deepEqual(fieldsOf({ ...valid, email: 'nie-mail' }), ['email']);
    assert.deepEqual(fieldsOf({ ...valid, email: '' }), ['email']);
  });
  test('uwagi ≤ 500 znaków', () => {
    assert.deepEqual(fieldsOf({ ...valid, note: 'x'.repeat(500) }), []);
    assert.deepEqual(fieldsOf({ ...valid, note: 'x'.repeat(501) }), ['note']);
  });
  test('zabieg z listy, data i godzina na siatce', () => {
    assert.deepEqual(fieldsOf({ ...valid, treatment: 'konsultacja' }), ['treatment']);
    assert.deepEqual(fieldsOf({ ...valid, date: '2026-02-30' }), ['date']);
    assert.deepEqual(fieldsOf({ ...valid, time: '12:15' }), ['time']);
    assert.deepEqual(fieldsOf({ ...valid, time: '7:00' }), ['time']);
  });
  test('formToken wymagany (napis); requestId opcjonalny, tylko UUID', () => {
    assert.deepEqual(fieldsOf({ ...valid, formToken: undefined }), ['formToken']);
    assert.deepEqual(fieldsOf({ ...valid, formToken: 123 }), ['formToken']);
    assert.deepEqual(fieldsOf({ ...valid, requestId: '0b8f5a52-5d2c-4c1e-9d59-3b0a3f5c1e2a' }), []);
    assert.deepEqual(fieldsOf({ ...valid, requestId: '../../events/x' }), ['requestId']);
  });
  test('uwagi: bez znaków bidi / zero-width, bez linków', () => {
    const r = bookingSchema.safeParse({ ...valid, note: 'Pierwszy\u200B zabieg \u202Eexe.gpj\uFEFF' });
    assert.equal(r.success, true);
    assert.equal(r.data.note, 'Pierwszy zabieg exe.gpj');
    for (const note of ['Zobacz https://phish.example/login', 'www.phish.example', 'hxxp://x', 'javascript://%0aalert(1)']) {
      assert.deepEqual(fieldsOf({ ...valid, note }), ['note'], note);
    }
    assert.deepEqual(fieldsOf({ ...valid, note: 'Inspiracja: brwi jak na instagramie salonu' }), []);
  });
  test('brak wszystkiego → lista pól bez wartości', () => {
    const fields = fieldsOf({});
    for (const f of ['treatment', 'date', 'time', 'name', 'phone', 'email', 'formToken']) assert.ok(fields.includes(f), f);
  });
  test('nieznane pola są pomijane', () => {
    const r = bookingSchema.safeParse({ ...valid, attendees: ['x@y.z'] });
    assert.equal(r.success, true);
    assert.equal('attendees' in r.data, false);
  });
});

describe('parseSlotsQuery', () => {
  const q = (s) => parseSlotsQuery(new URLSearchParams(s));
  test('date albo month – dokładnie jedno', () => {
    assert.equal(q('date=2026-10-26&treatment=korekta').success, true);
    assert.equal(q('month=2026-10&treatment=korekta').success, true);
    assert.equal(q('treatment=korekta').success, false);
    assert.equal(q('date=2026-10-26&month=2026-10&treatment=korekta').success, false);
  });
  test('zła data / miesiąc / zabieg', () => {
    assert.deepEqual(issueFields(q('date=2026-13-01&treatment=korekta').error), ['date']);
    assert.deepEqual(issueFields(q('month=2026-1&treatment=korekta').error), ['month']);
    assert.deepEqual(issueFields(q('date=2026-10-26&treatment=nope').error), ['treatment']);
  });
});
