import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createGoogleCalendar } from './google.js';
import { createMemoryCalendar, sampleEvents } from './memory.js';

const NOW = Date.parse('2026-10-19T08:00:00Z'); // pon 19.10.2026
const TZ = 'Europe/Warsaw';
const DEV = { NODE_ENV: 'development' };

describe('memory provider', () => {
  test('odmawia działania w production', () => {
    assert.throws(() => createMemoryCalendar({ env: { NODE_ENV: 'production' } }), /production/);
  });

  test('ma ten sam interfejs co google.js', () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    const google = createGoogleCalendar({ clientEmail: 'a@b.iam.gserviceaccount.com', privateKey, calendarId: 'c@d', fetchImpl: async () => {} });
    const memory = createMemoryCalendar({ env: DEV, seed: false });
    for (const method of ['freeBusy', 'listEvents', 'getEvent', 'insertEvent', 'patchEvent', 'deleteEvent']) {
      assert.equal(typeof google[method], 'function', `google.${method}`);
      assert.equal(typeof memory[method], 'function', `memory.${method}`);
    }
  });

  test('przykładowe zajętości w najbliższych dniach roboczych po pojutrze', () => {
    const events = sampleEvents(NOW, TZ);
    assert.equal(events.length, 5);
    // 21.10 (śr) 12:00–14:00 CEST
    assert.equal(events[0].start.dateTime, '2026-10-21T10:00:00.000Z');
    // całodniowe „Dostępny” w pt 23.10
    assert.deepEqual(events[3].start, { date: '2026-10-23' });
    assert.equal(events[3].transparency, 'transparent');
  });

  test('freeBusy pomija „Dostępny” (jak Google), listEvents zwraca wszystko', async () => {
    const cal = createMemoryCalendar({ env: DEV, now: () => NOW });
    const range = { timeMin: '2026-10-22T22:00:00Z', timeMax: '2026-10-23T22:00:00Z' }; // pt 23.10 lokalnie
    assert.deepEqual(await cal.freeBusy(range), []);
    const events = await cal.listEvents(range);
    assert.equal(events.length, 1);
    assert.equal(events[0].id, 'sample4');
    assert.equal(events[0].summary, undefined, 'listEvents nie zwraca tytułów (jak fields w google.js)');
  });

  test('freeBusy scala nachodzące przedziały i przycina do zakresu', async () => {
    const cal = createMemoryCalendar({ env: DEV, seed: false, now: () => NOW });
    const add = (s, e) => cal.insertEvent({ start: { dateTime: s }, end: { dateTime: e } });
    await add('2026-10-26T09:00:00Z', '2026-10-26T10:00:00Z');
    await add('2026-10-26T09:30:00Z', '2026-10-26T11:00:00Z');
    await add('2026-10-26T13:00:00Z', '2026-10-26T14:00:00Z');
    const busy = await cal.freeBusy({ timeMin: '2026-10-26T09:15:00Z', timeMax: '2026-10-26T13:30:00Z' });
    assert.deepEqual(busy, [
      { start: '2026-10-26T09:15:00.000Z', end: '2026-10-26T11:00:00.000Z' },
      { start: '2026-10-26T13:00:00.000Z', end: '2026-10-26T13:30:00.000Z' },
    ]);
  });

  test('insert → list → delete', async () => {
    const cal = createMemoryCalendar({ env: DEV, seed: false, now: () => NOW });
    const created = await cal.insertEvent({
      summary: 'Wizyta',
      start: { dateTime: '2026-10-26T10:00:00+01:00' },
      end: { dateTime: '2026-10-26T11:00:00+01:00' },
      extendedProperties: { private: { source: 'www', bookingId: 'b1' } },
    });
    assert.match(created.id, /^[0-9a-f]{32}$/);
    assert.equal(created.created, new Date(NOW).toISOString());
    const list = await cal.listEvents({ timeMin: '2026-10-26T00:00:00Z', timeMax: '2026-10-27T00:00:00Z' });
    assert.equal(list.length, 1);
    assert.equal(list[0].extendedProperties.private.bookingId, 'b1');
    await cal.deleteEvent(created.id);
    assert.equal((await cal.listEvents({ timeMin: '2026-10-26T00:00:00Z', timeMax: '2026-10-27T00:00:00Z' })).length, 0);
  });

  test('insertEvent odrzuca złe przedziały', async () => {
    const cal = createMemoryCalendar({ env: DEV, seed: false });
    await assert.rejects(cal.insertEvent({}), TypeError);
    await assert.rejects(cal.insertEvent({ start: { dateTime: '2026-10-26T11:00:00Z' }, end: { dateTime: '2026-10-26T10:00:00Z' } }), TypeError);
  });
});
