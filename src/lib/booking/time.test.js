import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  datesOfMonth,
  diffDays,
  formatIsoWithOffset,
  getOffsetMinutes,
  isAmbiguousLocalTime,
  isValidTimeZone,
  parseDate,
  parseMonth,
  parseTime,
  todayInZone,
  utcToZoned,
  weekdayOf,
  zonedToUtc,
} from './time.js';

const TZ = 'Europe/Warsaw';
const iso = (d) => (d ? d.toISOString() : d);

describe('zonedToUtc – zmiana czasu jesienią (25.10.2026, CEST → CET)', () => {
  test('10:00 w dniu zmiany to już czas zimowy (UTC+1)', () => {
    assert.equal(iso(zonedToUtc('2026-10-25', '10:00', TZ)), '2026-10-25T09:00:00.000Z');
  });
  test('dzień wcześniej obowiązuje czas letni (UTC+2)', () => {
    assert.equal(iso(zonedToUtc('2026-10-24', '10:00', TZ)), '2026-10-24T08:00:00.000Z');
  });
  test('dzień później czas zimowy (UTC+1)', () => {
    assert.equal(iso(zonedToUtc('2026-10-26', '10:00', TZ)), '2026-10-26T09:00:00.000Z');
  });
  test('01:59 jest jednoznaczna (jeszcze CEST)', () => {
    assert.equal(iso(zonedToUtc('2026-10-25', '01:59', TZ)), '2026-10-24T23:59:00.000Z');
    assert.equal(isAmbiguousLocalTime('2026-10-25', '01:59', TZ), false);
  });
  test('godziny „podwójne” 02:00–02:59: earlier / later / reject', () => {
    for (const [time, earlier, later] of [
      ['02:00', '2026-10-25T00:00:00.000Z', '2026-10-25T01:00:00.000Z'],
      ['02:30', '2026-10-25T00:30:00.000Z', '2026-10-25T01:30:00.000Z'],
      ['02:59', '2026-10-25T00:59:00.000Z', '2026-10-25T01:59:00.000Z'],
    ]) {
      assert.equal(iso(zonedToUtc('2026-10-25', time, TZ)), earlier, `${time} domyślnie = earlier`);
      assert.equal(iso(zonedToUtc('2026-10-25', time, TZ, { disambiguation: 'earlier' })), earlier);
      assert.equal(iso(zonedToUtc('2026-10-25', time, TZ, { disambiguation: 'later' })), later);
      assert.equal(zonedToUtc('2026-10-25', time, TZ, { disambiguation: 'reject' }), null);
      assert.equal(isAmbiguousLocalTime('2026-10-25', time, TZ), true);
    }
  });
  test('03:00 jest jednoznaczna (CET)', () => {
    assert.equal(iso(zonedToUtc('2026-10-25', '03:00', TZ, { disambiguation: 'reject' })), '2026-10-25T02:00:00.000Z');
  });
});

describe('zonedToUtc – zmiana czasu wiosną (29.03.2026, CET → CEST)', () => {
  test('10:00 w dniu zmiany to już czas letni (UTC+2)', () => {
    assert.equal(iso(zonedToUtc('2026-03-29', '10:00', TZ)), '2026-03-29T08:00:00.000Z');
  });
  test('dzień wcześniej obowiązuje czas zimowy (UTC+1)', () => {
    assert.equal(iso(zonedToUtc('2026-03-28', '10:00', TZ)), '2026-03-28T09:00:00.000Z');
  });
  test('godziny „nieistniejące” 02:00–02:59 → null (w każdym trybie)', () => {
    for (const time of ['02:00', '02:15', '02:30', '02:59']) {
      for (const disambiguation of ['earlier', 'later', 'reject']) {
        assert.equal(zonedToUtc('2026-03-29', time, TZ, { disambiguation }), null, `${time} ${disambiguation}`);
      }
    }
  });
  test('granice dziury: 01:59 (CET) i 03:00 (CEST) istnieją', () => {
    assert.equal(iso(zonedToUtc('2026-03-29', '01:59', TZ)), '2026-03-29T00:59:00.000Z');
    assert.equal(iso(zonedToUtc('2026-03-29', '03:00', TZ)), '2026-03-29T01:00:00.000Z');
  });
});

describe('zonedToUtc – inne przypadki', () => {
  test('zły format lub nieistniejąca data → null', () => {
    assert.equal(zonedToUtc('2026-02-30', '10:00', TZ), null);
    assert.equal(zonedToUtc('2026-10-26', '24:00', TZ), null);
    assert.equal(zonedToUtc('2026-10-26', '9:00', TZ), null);
    assert.equal(zonedToUtc('26-10-2026', '10:00', TZ), null);
  });
  test('round-trip utcToZoned(zonedToUtc(x)) = x dla każdej pełnej godziny w roku (poza dziurą)', () => {
    let date = '2026-01-01';
    for (let i = 0; i < 365; i += 1) {
      for (let h = 0; h < 24; h += 1) {
        const time = `${String(h).padStart(2, '0')}:00`;
        const utc = zonedToUtc(date, time, TZ);
        if (!utc) {
          assert.equal(date, '2026-03-29');
          assert.equal(time, '02:00');
          continue;
        }
        const back = utcToZoned(utc, TZ);
        assert.equal(`${back.date} ${back.time}`, `${date} ${time}`);
      }
      date = addDays(date, 1);
    }
  });
  test('inne strefy (offsety niecałogodzinne i ujemne)', () => {
    assert.equal(iso(zonedToUtc('2026-07-01', '12:00', 'Asia/Kolkata')), '2026-07-01T06:30:00.000Z');
    assert.equal(iso(zonedToUtc('2026-01-15', '12:00', 'America/St_Johns')), '2026-01-15T15:30:00.000Z');
    assert.equal(iso(zonedToUtc('2026-01-15', '12:00', 'UTC')), '2026-01-15T12:00:00.000Z');
  });
});

describe('offsety i formatowanie', () => {
  test('getOffsetMinutes', () => {
    assert.equal(getOffsetMinutes(Date.parse('2026-01-15T12:00:00Z'), TZ), 60);
    assert.equal(getOffsetMinutes(Date.parse('2026-07-15T12:00:00Z'), TZ), 120);
    assert.equal(getOffsetMinutes(Date.parse('2026-10-25T00:59:59Z'), TZ), 120);
    assert.equal(getOffsetMinutes(Date.parse('2026-10-25T01:00:00Z'), TZ), 60);
    assert.equal(getOffsetMinutes(Date.parse('2026-03-29T00:59:59Z'), TZ), 60);
    assert.equal(getOffsetMinutes(Date.parse('2026-03-29T01:00:00Z'), TZ), 120);
    assert.equal(getOffsetMinutes(Date.now(), 'UTC'), 0);
    assert.equal(getOffsetMinutes(Date.parse('2026-01-15T12:00:00Z'), 'America/St_Johns'), -210);
  });
  test('formatIsoWithOffset', () => {
    assert.equal(formatIsoWithOffset(zonedToUtc('2026-10-25', '10:00', TZ), TZ), '2026-10-25T10:00:00+01:00');
    assert.equal(formatIsoWithOffset(zonedToUtc('2026-10-24', '10:00', TZ), TZ), '2026-10-24T10:00:00+02:00');
    assert.equal(formatIsoWithOffset(new Date('2026-01-15T12:00:00Z'), 'America/St_Johns'), '2026-01-15T08:30:00-03:30');
  });
  test('utcToZoned: północ to 00:00, nie 24:00; dzień tygodnia', () => {
    const z = utcToZoned(new Date('2026-10-25T23:00:00Z'), TZ);
    assert.equal(z.date, '2026-10-26');
    assert.equal(z.time, '00:00');
    assert.equal(z.minutes, 0);
    assert.equal(z.weekday, 1);
  });
  test('todayInZone: 23:30 UTC to już następny dzień w Warszawie', () => {
    assert.equal(todayInZone(Date.parse('2026-10-18T23:30:00Z'), TZ), '2026-10-19');
    assert.equal(todayInZone(Date.parse('2026-10-18T21:59:00Z'), TZ), '2026-10-18');
  });
  test('isValidTimeZone', () => {
    assert.equal(isValidTimeZone(TZ), true);
    assert.equal(isValidTimeZone('Mars/Olympus'), false);
  });
});

describe('daty kalendarzowe', () => {
  test('parseDate', () => {
    assert.deepEqual(parseDate('2026-10-25'), { y: 2026, m: 10, d: 25 });
    assert.equal(parseDate('2026-02-29'), null);
    assert.deepEqual(parseDate('2028-02-29'), { y: 2028, m: 2, d: 29 });
    assert.equal(parseDate('2026-13-01'), null);
    assert.equal(parseDate('2026-1-01'), null);
    assert.equal(parseDate(' 2026-01-01'), null);
    assert.equal(parseDate(20261025), null);
  });
  test('parseTime / parseMonth', () => {
    assert.equal(parseTime('00:00'), 0);
    assert.equal(parseTime('23:59'), 23 * 60 + 59);
    assert.equal(parseTime('24:00'), null);
    assert.equal(parseTime('10:60'), null);
    assert.deepEqual(parseMonth('2026-10'), { y: 2026, m: 10 });
    assert.equal(parseMonth('2026-13'), null);
  });
  test('addDays / diffDays / weekdayOf / datesOfMonth', () => {
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
    assert.equal(addDays('2026-03-28', 2), '2026-03-30');
    assert.equal(diffDays('2026-10-19', '2026-12-18'), 60);
    assert.equal(weekdayOf('2026-10-25'), 0);
    assert.equal(weekdayOf('2026-10-26'), 1);
    assert.equal(datesOfMonth('2026-02').length, 28);
    assert.equal(datesOfMonth('2026-10')[30], '2026-10-31');
    assert.deepEqual(datesOfMonth('bad'), []);
  });
});
