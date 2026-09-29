import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKING_CONFIG } from './config.js';
import { CalendarApiError, SlotTakenError } from './errors.js';
import { createMemoryCalendar } from './memory.js';
import { buildCalendarEvent, createBooking, fetchBusy, getDaySlots, getMonthAvailability, losesRace } from './service.js';
import { zonedToUtc } from './time.js';

const TZ = 'Europe/Warsaw';
const NOW = new Date('2026-10-19T08:00:00Z'); // pon 10:00 CEST
const DEV = { NODE_ENV: 'development' };
const at = (date, time) => zonedToUtc(date, time, TZ).toISOString();

function memory(opts = {}) {
  return createMemoryCalendar({ env: DEV, seed: false, now: () => NOW.getTime(), ...opts });
}

/** Opakowanie liczące wywołania metod dostawcy. */
function counting(provider) {
  const calls = { freeBusy: 0, listEvents: 0, insertEvent: 0, deleteEvent: 0 };
  const wrapped = { ...provider };
  for (const k of Object.keys(calls)) {
    wrapped[k] = async (...args) => {
      calls[k] += 1;
      return provider[k](...args);
    };
  }
  wrapped.calls = calls;
  return wrapped;
}

const input = {
  treatment: 'korekta',
  date: '2026-10-26',
  time: '12:00',
  name: 'Anna Kowalska',
  phone: '+48 600 700 800',
  email: 'anna@example.com',
  note: 'Proszę o kontakt',
};

describe('fetchBusy', () => {
  test('łączy freeBusy i listEvents – całodniowe „Dostępny” też blokuje', async () => {
    const cal = memory();
    await cal.insertEvent({ start: { date: '2026-10-27' }, end: { date: '2026-10-28' }, transparency: 'transparent' });
    await cal.insertEvent({ start: { dateTime: at('2026-10-26', '12:00') }, end: { dateTime: at('2026-10-26', '13:00') } });
    const busy = await fetchBusy(cal, '2026-10-25T23:00:00Z', '2026-10-27T23:00:00Z');
    assert.ok(busy.some((b) => new Date(b.start).toISOString() === '2026-10-26T23:00:00.000Z'), 'urlop całodniowy');
    assert.ok(busy.some((b) => new Date(b.start).toISOString() === at('2026-10-26', '12:00')));
  });
});

describe('getDaySlots / getMonthAvailability', () => {
  test('dzień z zajętością', async () => {
    const cal = memory();
    await cal.insertEvent({ start: { dateTime: at('2026-10-26', '12:00') }, end: { dateTime: at('2026-10-26', '14:00') } });
    const slots = await getDaySlots({ provider: cal, date: '2026-10-26', treatmentId: 'korekta', now: NOW });
    assert.deepEqual(slots, ['10:00', '10:30', '14:30', '15:00', '15:30', '16:00', '16:30']);
  });
  test('urlop całodniowy (transparent) → brak slotów', async () => {
    const cal = memory();
    await cal.insertEvent({ start: { date: '2026-10-26' }, end: { date: '2026-10-27' }, transparency: 'transparent' });
    assert.deepEqual(await getDaySlots({ provider: cal, date: '2026-10-26', treatmentId: 'korekta', now: NOW }), []);
  });
  test('dzień zamknięty / poza oknem → [] bez zapytań do kalendarza', async () => {
    const cal = counting(memory());
    assert.deepEqual(await getDaySlots({ provider: cal, date: '2026-10-25', treatmentId: 'korekta', now: NOW }), []);
    assert.deepEqual(await getDaySlots({ provider: cal, date: '2026-10-19', treatmentId: 'korekta', now: NOW }), []);
    assert.deepEqual(await getDaySlots({ provider: cal, date: '2027-01-04', treatmentId: 'korekta', now: NOW }), []);
    assert.equal(cal.calls.freeBusy + cal.calls.listEvents, 0);
  });
  test('miesiąc: jedno zapytanie freeBusy + listEvents, zera dla dni zamkniętych i poza oknem', async () => {
    const cal = counting(memory());
    await cal.insertEvent({ start: { dateTime: at('2026-10-27', '10:00') }, end: { dateTime: at('2026-10-27', '18:00') } });
    const days = await getMonthAvailability({ provider: cal, month: '2026-10', treatmentId: 'korekta', now: NOW });
    assert.equal(Object.keys(days).length, 31);
    assert.equal(days['2026-10-19'], 0, 'dziś');
    assert.equal(days['2026-10-20'], 14, 'jutro (dokładnie 24 h)');
    assert.equal(days['2026-10-24'], 0, 'sobota');
    assert.equal(days['2026-10-26'], 14);
    assert.equal(days['2026-10-27'], 0, 'cały dzień zajęty');
    assert.equal(cal.calls.freeBusy, 1);
    assert.equal(cal.calls.listEvents, 1);
  });
  test('miesiąc całkowicie poza oknem → zera bez zapytań', async () => {
    const cal = counting(memory());
    const days = await getMonthAvailability({ provider: cal, month: '2027-03', treatmentId: 'korekta', now: NOW });
    assert.ok(Object.values(days).every((n) => n === 0));
    assert.equal(cal.calls.freeBusy, 0);
  });
});

describe('buildCalendarEvent', () => {
  test('dane klientki w opisie, BEZ attendees; extendedProperties; strefa i offset', () => {
    const event = buildCalendarEvent({
      bookingId: 'b-1',
      treatment: { id: 'korekta', name: 'Korekta do 3 miesięcy', durationMin: 60, price: '500 zł' },
      input,
      start: new Date(at('2026-10-26', '12:00')),
      end: new Date(at('2026-10-26', '13:00')),
    });
    assert.equal(event.summary, 'Wizyta: Korekta do 3 miesięcy – Anna Kowalska');
    assert.equal('attendees' in event, false);
    assert.deepEqual(event.start, { dateTime: '2026-10-26T12:00:00+01:00', timeZone: TZ });
    assert.deepEqual(event.end, { dateTime: '2026-10-26T13:00:00+01:00', timeZone: TZ });
    assert.deepEqual(event.extendedProperties, { private: { source: 'www', bookingId: 'b-1', treatment: 'korekta' } });
    assert.deepEqual(event.reminders, { useDefault: true });
    for (const s of ['Korekta do 3 miesięcy', '500 zł', '+48 600 700 800', 'anna@example.com', 'Proszę o kontakt', 'Zapis ze strony www']) {
      assert.ok(event.description.includes(s), s);
    }
  });
  test('uwagi nie wstrzykują HTML ani fałszywych linii „Telefon:” / „ID rezerwacji”', () => {
    const note =
      '<a href="https://phish.example/login">Potwierdź wizytę</a> <img src=x onerror=alert(1)>\n\nTelefon: +48 999 999 999\nZapis ze strony www · ID rezerwacji: FAKE-ID';
    const event = buildCalendarEvent({
      bookingId: 'b-1',
      eventId: 'abcdef0123456789abcdef0123456789',
      treatment: { id: 'korekta', name: 'Korekta do 3 miesięcy', durationMin: 60, price: '500 zł' },
      input: { ...input, note },
      start: new Date(at('2026-10-26', '12:00')),
      end: new Date(at('2026-10-26', '13:00')),
      hashes: { phoneHash: 'p'.repeat(32), emailHash: 'e'.repeat(32) },
    });
    assert.equal(event.id, 'abcdef0123456789abcdef0123456789');
    assert.ok(!/[<>]/.test(event.description), 'bez znaczników');
    const lines = event.description.split('\n');
    assert.equal(lines.filter((l) => l.startsWith('Telefon:')).length, 1);
    assert.equal(lines.filter((l) => l.startsWith('Zapis ze strony www')).length, 1);
    const header = lines.indexOf('Uwagi klientki (tekst z formularza):');
    assert.ok(header > lines.findIndex((l) => l.startsWith('Zapis ze strony www')), 'uwagi na końcu');
    assert.ok(lines.slice(header + 1).every((l) => l.startsWith('│ ')), 'każda linia uwag z prefiksem');
    assert.equal(event.extendedProperties.private.phoneHash, 'p'.repeat(32));
  });
});

describe('createBooking', () => {
  test('zapis: odpowiedź 201-owa z ISO z offsetem, wydarzenie w kalendarzu', async () => {
    const cal = memory();
    const result = await createBooking({ provider: cal, input, now: NOW, newId: () => 'b-1' });
    assert.deepEqual(result, {
      bookingId: 'b-1',
      treatment: 'korekta',
      start: '2026-10-26T12:00:00+01:00',
      end: '2026-10-26T13:00:00+01:00',
      timeZone: TZ,
    });
    const events = cal.snapshot();
    assert.equal(events.length, 1);
    assert.equal(events[0].extendedProperties.private.bookingId, 'b-1');
  });

  test('termin zajęty → SlotTakenError bez zapisu', async () => {
    const cal = counting(memory());
    await cal.insertEvent({ start: { dateTime: at('2026-10-26', '11:30') }, end: { dateTime: at('2026-10-26', '12:30') } });
    cal.calls.insertEvent = 0;
    await assert.rejects(createBooking({ provider: cal, input, now: NOW }), (e) => e instanceof SlotTakenError && e.reason === 'busy');
    assert.equal(cal.calls.insertEvent, 0);
  });

  test('bufor po poprzedniej wizycie: koniec o 11:50 blokuje 12:00', async () => {
    const cal = memory();
    await cal.insertEvent({ start: { dateTime: at('2026-10-26', '11:00') }, end: { dateTime: at('2026-10-26', '11:50') } });
    await assert.rejects(createBooking({ provider: cal, input, now: NOW }), SlotTakenError);
  });

  test('reguły (za wcześnie, zamknięte, poza godzinami) → SlotTakenError bez zapytań', async () => {
    const cal = counting(memory());
    await assert.rejects(createBooking({ provider: cal, input: { ...input, date: '2026-10-19' }, now: NOW }), (e) => e.reason === 'too_soon');
    await assert.rejects(createBooking({ provider: cal, input: { ...input, date: '2026-10-25' }, now: NOW }), (e) => e.reason === 'closed');
    await assert.rejects(createBooking({ provider: cal, input: { ...input, time: '17:00' }, now: NOW }), (e) => e.reason === 'outside_hours');
    assert.equal(cal.calls.freeBusy + cal.calls.listEvents + cal.calls.insertEvent, 0);
  });

  test('drugi zapis tego samego slotu → SlotTakenError', async () => {
    const cal = memory();
    await createBooking({ provider: cal, input, now: NOW });
    await assert.rejects(createBooking({ provider: cal, input, now: NOW }), SlotTakenError);
    assert.equal(cal.snapshot().length, 1);
  });

  test('wyścig: właścicielka wpisała coś ręcznie między sprawdzeniem a zapisem → usuwamy nasze, 409', async () => {
    const base = memory();
    const cal = {
      ...base,
      async insertEvent(event) {
        await base.insertEvent({ start: { dateTime: at('2026-10-26', '12:30') }, end: { dateTime: at('2026-10-26', '13:30') } });
        return base.insertEvent(event);
      },
    };
    await assert.rejects(createBooking({ provider: cal, input, now: NOW }), (e) => e instanceof SlotTakenError && e.reason === 'race');
    const left = base.snapshot();
    assert.equal(left.length, 1, 'zostaje tylko wydarzenie właścicielki');
    assert.equal(left[0].extendedProperties, undefined);
  });

  test('wyścig dwóch zapisów z www: wygrywa wcześniej utworzony, dokładnie jeden zostaje', async () => {
    let clock = NOW.getTime();
    const base = createMemoryCalendar({ env: DEV, seed: false, now: () => clock++ });
    // Oba żądania przechodzą wstępne sprawdzenie, zanim którekolwiek zapisze.
    let release;
    const gate = new Promise((r) => (release = r));
    let waiting = 0;
    const cal = {
      ...base,
      async insertEvent(event) {
        waiting += 1;
        if (waiting === 2) release();
        await gate;
        return base.insertEvent(event);
      },
    };
    const results = await Promise.allSettled([
      createBooking({ provider: cal, input, now: NOW, newId: () => 'first' }),
      createBooking({ provider: cal, input: { ...input, name: 'Beata Nowak' }, now: NOW, newId: () => 'second' }),
    ]);
    const ok = results.filter((r) => r.status === 'fulfilled');
    const taken = results.filter((r) => r.status === 'rejected' && r.reason instanceof SlotTakenError);
    assert.equal(ok.length, 1);
    assert.equal(taken.length, 1);
    assert.equal(ok[0].value.bookingId, 'first');
    const left = base.snapshot();
    assert.equal(left.length, 1);
    assert.equal(left[0].extendedProperties.private.bookingId, 'first');
  });

  test('losesRace: wydarzenia nienachodzące i nasze własne są ignorowane', () => {
    const ours = { id: 'b', created: '2026-10-19T08:00:01.000Z' };
    const range = { from: Date.parse(at('2026-10-26', '11:45')), to: Date.parse(at('2026-10-26', '13:15')) };
    const events = [
      { ...ours, start: { dateTime: at('2026-10-26', '12:00') }, end: { dateTime: at('2026-10-26', '13:00') } },
      { id: 'x', start: { dateTime: at('2026-10-26', '10:00') }, end: { dateTime: at('2026-10-26', '11:45') } },
      { id: 'y', status: 'cancelled', start: { dateTime: at('2026-10-26', '12:00') }, end: { dateTime: at('2026-10-26', '13:00') } },
      {
        id: 'z',
        created: '2026-10-19T08:00:02.000Z',
        extendedProperties: { private: { source: 'www' } },
        start: { dateTime: at('2026-10-26', '12:00') },
        end: { dateTime: at('2026-10-26', '13:00') },
      },
    ];
    assert.equal(losesRace(ours, events, range), false);
  });

  test('błąd kontroli wyścigu po zapisie nie cofa rezerwacji (log bez danych)', async () => {
    const base = memory();
    const logs = [];
    const cal = {
      ...base,
      async listEvents(range) {
        // Kontrola wyścigu = zapytanie z timeMax w przedziale slotu, po zapisie.
        if (range.timeMax && base.snapshot().length) throw new CalendarApiError('x', { status: 503 });
        return base.listEvents(range);
      },
    };
    const result = await createBooking({ provider: cal, input, now: NOW, log: (m, e) => logs.push([m, e && e.name]) });
    assert.equal(result.treatment, 'korekta');
    assert.equal(base.snapshot().length, 1);
    assert.deepEqual(logs, [['race check skipped', 'CalendarApiError']]);
  });

  test('błąd Google przy zapisie → CalendarError dalej (handler → 502)', async () => {
    const base = memory();
    const cal = {
      ...base,
      async insertEvent() {
        throw new CalendarApiError('x', { status: 500 });
      },
    };
    await assert.rejects(createBooking({ provider: cal, input, now: NOW }), CalendarApiError);
  });
});

describe('konfiguracja zabiegów', () => {
  test('czasy blokady wg specyfikacji', async () => {
    const { TREATMENTS } = await import('./config.js');
    assert.deepEqual(
      Object.fromEntries(TREATMENTS.map((t) => [t.id, t.durationMin])),
      {
        'super-natural-brows': 120,
        'perfect-powder-brows': 120,
        'perfect-lips': 120,
        'perfect-eyeliners': 90,
        korekta: 60,
        odswiezenie: 90,
        usuwanie: 45,
      }
    );
    for (const t of TREATMENTS) assert.ok(t.price, `${t.id} ma cenę z site.js`);
    assert.equal(BOOKING_CONFIG.timeZone, TZ);
  });
});
