/**
 * Testy regresji z przeglądu „poprawność czasu i slotów” (wartości oczekiwane zmierzone
 * sondami): DST 2027, POST z offsetem +02:00, granice okna o północy, minLeadHours przez
 * zmianę czasu, wydarzenie całodniowe w dobie 25 h, kontrola wyścigu na granicy bufora,
 * .ics w czasie letnim, nazwa pliku .ics o 00:30 oraz uruchomienie pod inną TZ procesu.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { BOOKING_CONFIG } from './config.js';
import { buildBookingIcs, icsFileName } from './ics.js';
import { createMemoryCalendar } from './memory.js';
import { createBooking, losesRace } from './service.js';
import { bookingWindow, computeSlots, dayRange, eventInterval } from './slots.js';
import { addDays, formatMinutes, utcToZoned, zonedToUtc } from './time.js';

const TZ = 'Europe/Warsaw';
const HOUR = 3600 * 1000;
const DEV = { NODE_ENV: 'development' };
const SECRET = 'test-secret-regression-0123456789';
const quiet = () => {};

describe('DST 2027 (28.03 / 31.10)', () => {
  test('dziura 28.03 02:30 → null; podwójna 31.10 02:30 → earlier / later / reject', () => {
    assert.equal(zonedToUtc('2027-03-28', '02:30', TZ), null);
    assert.equal(zonedToUtc('2027-10-31', '02:30', TZ, { disambiguation: 'earlier' }).toISOString(), '2027-10-31T00:30:00.000Z');
    assert.equal(zonedToUtc('2027-10-31', '02:30', TZ, { disambiguation: 'later' }).toISOString(), '2027-10-31T01:30:00.000Z');
    assert.equal(zonedToUtc('2027-10-31', '02:30', TZ, { disambiguation: 'reject' }), null);
  });
  test('doba 28.03.2027 ma 23 h, 31.10.2027 – 25 h', () => {
    const len = (d) => {
      const r = dayRange(d, TZ);
      return (r.end - r.start) / HOUR;
    };
    assert.equal(len('2027-03-28'), 23);
    assert.equal(len('2027-10-31'), 25);
    assert.equal(len('2027-06-15'), 24);
  });
  test('round-trip co 30 min przez cały 2027: brak rozjazdów, null tylko 28.03 02:00 i 02:30', () => {
    const nulls = [];
    for (let d = '2027-01-01'; d <= '2027-12-31'; d = addDays(d, 1)) {
      for (let m = 0; m < 24 * 60; m += 30) {
        const time = formatMinutes(m);
        const utc = zonedToUtc(d, time, TZ);
        if (!utc) {
          nulls.push(`${d} ${time}`);
          continue;
        }
        const back = utcToZoned(utc, TZ);
        assert.equal(`${back.date} ${back.time}`, `${d} ${time}`);
      }
    }
    assert.deepEqual(nulls, ['2027-03-28 02:00', '2027-03-28 02:30']);
  });
});

describe('POST: offset +01:00 / +02:00 wg daty wizyty', () => {
  const book = (now, input) =>
    createBooking({
      provider: createMemoryCalendar({ env: DEV, seed: false, now: () => now.getTime() }),
      input: { name: 'Anna Kowalska', phone: '600700800', email: 'anna@example.com', note: '', ...input },
      now,
      secret: SECRET,
      log: quiet,
    });
  test('23.10.2026 (czas letni) → +02:00; plik .ics w UTC', async () => {
    const r = await book(new Date('2026-10-19T08:00:00Z'), { treatment: 'perfect-lips', date: '2026-10-23', time: '10:00' });
    assert.equal(r.start, '2026-10-23T10:00:00+02:00');
    assert.equal(r.end, '2026-10-23T12:00:00+02:00');
    const ics = buildBookingIcs(r, { now: Date.parse('2026-10-19T08:00:00Z') });
    assert.ok(ics.includes('DTSTART:20261023T080000Z'));
    assert.ok(ics.includes('DTEND:20261023T100000Z'));
  });
  test('30.03.2026 → +02:00, 27.03.2026 → +01:00', async () => {
    const now = new Date('2026-03-20T09:00:00Z');
    assert.equal((await book(now, { treatment: 'korekta', date: '2026-03-30', time: '15:30' })).start, '2026-03-30T15:30:00+02:00');
    assert.equal((await book(now, { treatment: 'korekta', date: '2026-03-27', time: '15:30' })).start, '2026-03-27T15:30:00+01:00');
  });
});

describe('okno rezerwacji na granicy północy (czas salonu)', () => {
  const win = (iso) => {
    const w = bookingWindow(Date.parse(iso), BOOKING_CONFIG);
    return `${w.firstDate}..${w.lastDate}`;
  };
  test('18.10 23:59:59.999 CEST → 19.10..17.12; 19.10 00:00 → 20.10..18.12', () => {
    assert.equal(win('2026-10-18T21:59:59.999Z'), '2026-10-19..2026-12-17');
    assert.equal(win('2026-10-18T22:00:00.000Z'), '2026-10-20..2026-12-18');
  });
  test('Sylwester 2026 o północy → 2027-01-02..2027-03-02', () => {
    assert.equal(win('2026-12-31T23:00:00.000Z'), '2027-01-02..2027-03-02');
  });
});

describe('minLeadHours przez zmianę czasu (konfiguracja z otwartym weekendem)', () => {
  const config = {
    ...BOOKING_CONFIG,
    workingHours: { ...BOOKING_CONFIG.workingHours, 0: ['10:00', '18:00'], 6: ['10:00', '18:00'] },
  };
  test('sobota 24.10 10:00 CEST + 24 h = niedziela 25.10 09:00 CET → pierwszy slot 10:00', () => {
    const slots = computeSlots({ date: '2026-10-25', durationMin: 60, busy: [], now: Date.parse('2026-10-24T08:00:00Z'), config });
    assert.equal(slots[0], '10:00');
  });
  test('sobota 28.03 10:00 CET + 24 h = niedziela 29.03 11:00 CEST → pierwszy slot 11:00', () => {
    const slots = computeSlots({ date: '2026-03-29', durationMin: 60, busy: [], now: Date.parse('2026-03-28T09:00:00Z'), config });
    assert.equal(slots[0], '11:00');
  });
  test('wydarzenie całodniowe 25.10 = 25 h (24.10 22:00Z – 25.10 23:00Z): blokuje 25.10, nie blokuje 26.10', () => {
    const iv = eventInterval({ start: { date: '2026-10-25' }, end: { date: '2026-10-26' } }, TZ);
    assert.equal(new Date(iv.start).toISOString(), '2026-10-24T22:00:00.000Z');
    assert.equal(new Date(iv.end).toISOString(), '2026-10-25T23:00:00.000Z');
    const now = Date.parse('2026-10-19T08:00:00Z');
    assert.deepEqual(computeSlots({ date: '2026-10-25', durationMin: 60, busy: [iv], now, config }), []);
    assert.equal(computeSlots({ date: '2026-10-26', durationMin: 60, busy: [iv], now, config })[0], '10:00');
  });
});

describe('losesRace na granicy bufora', () => {
  test('wydarzenie właścicielki kończące się dokładnie o start − bufor nie wygrywa', () => {
    const start = Date.parse('2026-10-26T11:00:00Z'); // 12:00 CET
    const from = start - BOOKING_CONFIG.bufferMin * 60 * 1000;
    const to = start + (60 + BOOKING_CONFIG.bufferMin) * 60 * 1000;
    const owner = { id: 'o', start: { dateTime: '2026-10-26T09:45:00Z' }, end: { dateTime: new Date(from).toISOString() } };
    assert.equal(losesRace({ id: 'ours', created: '2026-10-19T08:00:00Z' }, [owner], { from, to }), false);
    const overlapping = { ...owner, end: { dateTime: new Date(from + 60_000).toISOString() } };
    assert.equal(losesRace({ id: 'ours', created: '2026-10-19T08:00:00Z' }, [overlapping], { from, to }), true);
  });
});

describe('icsFileName – data w strefie salonu', () => {
  test('Date/ms o 00:30 w Warszawie → dzień warszawski, nie UTC', () => {
    assert.equal(icsFileName(new Date('2026-10-25T23:30:00Z')), 'wizyta-2026-10-26.ics');
    assert.equal(icsFileName(Date.parse('2026-07-01T22:30:00Z')), 'wizyta-2026-07-02.ics');
    assert.equal(icsFileName('2026-10-26T00:30:00+01:00'), 'wizyta-2026-10-26.ics');
  });
});

describe('proces w innej strefie czasowej (TZ) – te same wyniki', () => {
  const script = `
    const time = await import(${JSON.stringify(new URL('./time.js', import.meta.url).href)});
    const slots = await import(${JSON.stringify(new URL('./slots.js', import.meta.url).href)});
    const { BOOKING_CONFIG } = await import(${JSON.stringify(new URL('./config.js', import.meta.url).href)});
    const w = slots.bookingWindow(Date.parse('2026-10-18T22:00:00Z'), BOOKING_CONFIG);
    const r = slots.dayRange('2026-10-25', 'Europe/Warsaw');
    console.log(JSON.stringify({
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      z: time.zonedToUtc('2026-03-29', '10:00', 'Europe/Warsaw').toISOString(),
      gap: time.zonedToUtc('2026-03-29', '02:30', 'Europe/Warsaw'),
      iso: time.formatIsoWithOffset(new Date('2026-10-25T09:00:00Z'), 'Europe/Warsaw'),
      window: w.firstDate + '..' + w.lastDate,
      day: (r.end - r.start) / 3600000,
      slots: slots.computeSlots({ date: '2026-10-26', durationMin: 120, busy: [], now: Date.parse('2026-10-19T08:00:00Z'), config: BOOKING_CONFIG }).length,
    }));
  `;
  const expected = {
    z: '2026-03-29T08:00:00.000Z',
    gap: null,
    iso: '2026-10-25T10:00:00+01:00',
    window: '2026-10-20..2026-12-18',
    day: 25,
    slots: 12,
  };
  for (const tz of ['UTC', 'America/New_York', 'Pacific/Kiritimati', 'Asia/Kolkata']) {
    test(`TZ=${tz}`, () => {
      const out = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
        env: { ...process.env, TZ: tz },
        encoding: 'utf8',
      });
      assert.equal(out.status, 0, out.stderr);
      const result = JSON.parse(out.stdout.trim());
      assert.notEqual(result.tz, 'Europe/Warsaw', 'proces naprawdę działa w innej strefie (ICU może zwrócić alias, np. Asia/Calcutta)');
      delete result.tz;
      assert.deepEqual(result, expected);
    });
  }
});
