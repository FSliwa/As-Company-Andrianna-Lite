import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBookingIcs, buildIcs, escapeIcsText, foldIcsLine, formatIcsDate, icsFileName } from './ics.js';

const utf8Len = (s) => new TextEncoder().encode(s).length;

describe('ics', () => {
  test('escapowanie RFC 5545', () => {
    assert.equal(escapeIcsText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');
  });
  test('daty w UTC', () => {
    assert.equal(formatIcsDate('2026-10-26T10:00:00+01:00'), '20261026T090000Z');
    assert.equal(formatIcsDate(new Date('2026-07-01T08:30:00Z')), '20260701T083000Z');
  });
  test('zawijanie linii ≤ 75 oktetów, bez cięcia znaków wielobajtowych', () => {
    const line = `DESCRIPTION:${'Zażółć gęślą jaźń '.repeat(12)}`;
    const folded = foldIcsLine(line);
    const parts = folded.split('\r\n');
    assert.ok(parts.length > 1);
    for (const p of parts) assert.ok(utf8Len(p) <= 75, `${utf8Len(p)} > 75`);
    assert.equal(parts.map((p, i) => (i ? p.slice(1) : p)).join(''), line);
    assert.equal(foldIcsLine('SHORT:x'), 'SHORT:x');
  });
  test('buildIcs: struktura, CRLF, alarm', () => {
    const ics = buildIcs({
      uid: 'abc@example.com',
      start: '2026-10-26T10:00:00+01:00',
      end: '2026-10-26T12:00:00+01:00',
      summary: 'Perfect Lips — AS COMPANY',
      location: 'Babushkina Academy, Warszawa',
      now: Date.parse('2026-10-19T08:00:00Z'),
    });
    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
    assert.ok(!/[^\r]\n/.test(ics), 'tylko CRLF');
    assert.match(ics, /\r\nDTSTART:20261026T090000Z\r\n/);
    assert.match(ics, /\r\nDTEND:20261026T110000Z\r\n/);
    assert.match(ics, /\r\nDTSTAMP:20261019T080000Z\r\n/);
    assert.match(ics, /\r\nLOCATION:Babushkina Academy\\, Warszawa\r\n/);
    assert.match(ics, /\r\nTRIGGER:-PT1440M\r\n/);
  });
  test('buildBookingIcs: nazwa zabiegu, bez danych osobowych', () => {
    const ics = buildBookingIcs(
      { bookingId: 'b-1', treatment: 'perfect-lips', start: '2026-10-26T10:00:00+01:00', end: '2026-10-26T12:00:00+01:00' },
      { now: Date.parse('2026-10-19T08:00:00Z') }
    );
    assert.match(ics, /SUMMARY:Perfect Lips — AS COMPANY/);
    assert.match(ics, /UID:b-1@/);
    assert.ok(!/Telefon|E-mail/.test(ics));
  });
  test('icsFileName: data lokalna z ISO z offsetem', () => {
    assert.equal(icsFileName('2026-10-26T10:00:00+01:00'), 'wizyta-2026-10-26.ics');
  });
});
