import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKING_CONFIG } from './config.js';
import {
  bookingWindow,
  computeSlots,
  countSlotsByDay,
  dayRange,
  evaluateSlot,
  eventInterval,
  isOnSlotGrid,
  isSlotAvailable,
  monthRange,
  normalizeBusy,
  overlaps,
} from './slots.js';
import { zonedToUtc } from './time.js';

const TZ = 'Europe/Warsaw';
const config = BOOKING_CONFIG;
// Poniedziałek 19.10.2026, 10:00 w Warszawie (CEST).
const NOW = new Date('2026-10-19T08:00:00Z');
const at = (date, time) => zonedToUtc(date, time, TZ).toISOString();
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
const grid = (from, to) => {
  const out = [];
  for (let m = from; m <= to; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  return out;
};

describe('konfiguracja startowa', () => {
  test('wartości ze specyfikacji', () => {
    assert.equal(config.timeZone, TZ);
    assert.equal(config.slotStepMin, 30);
    assert.equal(config.bufferMin, 15);
    assert.equal(config.minLeadHours, 24);
    assert.equal(config.maxDaysAhead, 60);
    assert.deepEqual([...config.workingHours[1]], ['10:00', '18:00']);
    assert.equal(config.workingHours[0], null);
    assert.equal(config.workingHours[6], null);
  });
});

describe('computeSlots – godziny pracy, zabieg + bufor', () => {
  test('120 min + 15 bufor: 10:00…15:30 (15:30+2:15 = 17:45 ≤ 18:00, 16:00 już nie)', () => {
    const slots = computeSlots({ date: '2026-10-26', durationMin: 120, now: NOW, config });
    assert.deepEqual(slots, grid(10 * 60, 15 * 60 + 30));
  });
  test('60 min + 15: ostatni 16:30; 45 min + 15: ostatni 17:00 (kończy się równo o 18:00)', () => {
    assert.deepEqual(computeSlots({ date: '2026-10-26', durationMin: 60, now: NOW, config }), grid(600, 990));
    assert.deepEqual(computeSlots({ date: '2026-10-26', durationMin: 45, now: NOW, config }), grid(600, 1020));
  });
  test('90 min: 16:00 + 1:45 = 17:45 → mieści się, 16:30 nie', () => {
    const slots = computeSlots({ date: '2026-10-26', durationMin: 90, now: NOW, config });
    assert.equal(slots.at(-1), '16:00');
  });
  test('sobota i niedziela zamknięte', () => {
    assert.deepEqual(computeSlots({ date: '2026-10-24', durationMin: 60, now: NOW, config }), []);
    assert.deepEqual(computeSlots({ date: '2026-10-25', durationMin: 60, now: NOW, config }), []);
    assert.equal(evaluateSlot({ date: '2026-10-24', time: '10:00', durationMin: 60, now: NOW, config }).reason, 'closed');
  });
  test('closedDates zamyka dzień roboczy', () => {
    const c = { ...config, closedDates: ['2026-10-26'] };
    assert.deepEqual(computeSlots({ date: '2026-10-26', durationMin: 60, now: NOW, config: c }), []);
    assert.equal(computeSlots({ date: '2026-10-27', durationMin: 60, now: NOW, config: c }).length, 14);
  });
  test('zła data / czas trwania → []', () => {
    assert.deepEqual(computeSlots({ date: '2026-02-30', durationMin: 60, now: NOW, config }), []);
    assert.deepEqual(computeSlots({ date: '2026-10-26', durationMin: 0, now: NOW, config }), []);
  });
});

describe('okno rezerwacji – minLeadHours i maxDaysAhead', () => {
  test('dokładnie teraz + 24 h jest dozwolone (granica włącznie)', () => {
    const slots = computeSlots({ date: '2026-10-20', durationMin: 60, now: NOW, config });
    assert.equal(slots[0], '10:00');
  });
  test('minutę później 10:00 wypada, pierwszy slot 10:30', () => {
    const now = new Date(NOW.getTime() + 60_000);
    const slots = computeSlots({ date: '2026-10-20', durationMin: 60, now, config });
    assert.equal(slots[0], '10:30');
    assert.equal(evaluateSlot({ date: '2026-10-20', time: '10:00', durationMin: 60, now, config }).reason, 'too_soon');
  });
  test('dziś i jutro przed upływem 24 h – brak slotów', () => {
    assert.deepEqual(computeSlots({ date: '2026-10-19', durationMin: 60, now: NOW, config }), []);
  });
  test('ostatni dzień = dziś + 60 (18.12.2026, pt), 21.12 już za daleko', () => {
    const win = bookingWindow(NOW, config);
    assert.equal(win.firstDate, '2026-10-20');
    assert.equal(win.lastDate, '2026-12-18');
    assert.equal(computeSlots({ date: '2026-12-18', durationMin: 60, now: NOW, config }).length, 14);
    assert.deepEqual(computeSlots({ date: '2026-12-21', durationMin: 60, now: NOW, config }), []);
    assert.equal(evaluateSlot({ date: '2026-12-21', time: '10:00', durationMin: 60, now: NOW, config }).reason, 'too_far');
  });
  test('okno liczone od daty lokalnej (23:30 UTC = następny dzień w Warszawie)', () => {
    const win = bookingWindow(new Date('2026-10-18T23:30:00Z'), config);
    assert.equal(win.lastDate, '2026-12-18');
  });
});

describe('kolizje z zajętością – przedziały półotwarte [start, end) + bufor', () => {
  // Korekta 60 min, bufor 15: slot 12:00 wymaga wolnego [11:45, 13:15).
  const base = { date: '2026-10-26', time: '12:00', durationMin: 60, now: NOW, config };
  test('zajętość kończąca się dokładnie o 11:45 nie blokuje 12:00', () => {
    assert.equal(isSlotAvailable({ ...base, busy: [{ start: at('2026-10-26', '10:00'), end: at('2026-10-26', '11:45') }] }), true);
  });
  test('zajętość do 11:46 blokuje 12:00 (bufor po poprzedniej wizycie)', () => {
    const r = evaluateSlot({ ...base, busy: [{ start: at('2026-10-26', '10:00'), end: at('2026-10-26', '11:46') }] });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'busy');
  });
  test('zajętość od dokładnie 13:15 nie blokuje 12:00', () => {
    assert.equal(isSlotAvailable({ ...base, busy: [{ start: at('2026-10-26', '13:15'), end: at('2026-10-26', '14:00') }] }), true);
  });
  test('zajętość od 13:14 blokuje 12:00 (bufor po naszym zabiegu)', () => {
    assert.equal(isSlotAvailable({ ...base, busy: [{ start: at('2026-10-26', '13:14'), end: at('2026-10-26', '14:00') }] }), false);
  });
  test('zajętość w środku zabiegu blokuje', () => {
    assert.equal(isSlotAvailable({ ...base, busy: [{ start: at('2026-10-26', '12:30'), end: at('2026-10-26', '12:31') }] }), false);
  });
  test('computeSlots omija zajęty środek dnia', () => {
    const busy = [{ start: at('2026-10-26', '12:00'), end: at('2026-10-26', '14:00') }];
    const slots = computeSlots({ date: '2026-10-26', durationMin: 60, busy, now: NOW, config });
    // 10:00 → blok do 11:15 < 12:00 ok; 10:30 → do 11:45 ok; 11:00 → do 12:15 koliduje.
    assert.deepEqual(slots, ['10:00', '10:30', '14:30', '15:00', '15:30', '16:00', '16:30']);
  });
  test('zajętość na cały dzień (np. wydarzenie całodniowe) → brak slotów', () => {
    const r = dayRange('2026-10-26', TZ);
    const busy = [{ start: r.start, end: r.end }];
    assert.deepEqual(computeSlots({ date: '2026-10-26', durationMin: 45, busy, now: NOW, config }), []);
  });
  test('Date, ms i ISO są akceptowane; śmieci pomijane', () => {
    const list = normalizeBusy([
      { start: new Date('2026-10-26T10:00:00Z'), end: Date.parse('2026-10-26T11:00:00Z') },
      { start: 'nonsense', end: '2026-10-26T11:00:00Z' },
      { start: '2026-10-26T12:00:00Z', end: '2026-10-26T12:00:00Z' },
      null,
    ]);
    assert.equal(list.length, 1);
  });
  test('overlaps: styk przedziałów nie jest kolizją', () => {
    assert.equal(overlaps(0, 10, 10, 20), false);
    assert.equal(overlaps(10, 20, 0, 10), false);
    assert.equal(overlaps(0, 11, 10, 20), true);
  });
});

describe('siatka slotów i granice godzin', () => {
  const base = { date: '2026-10-26', durationMin: 120, now: NOW, config };
  test('isOnSlotGrid', () => {
    assert.equal(isOnSlotGrid('2026-10-26', '10:00', config), true);
    assert.equal(isOnSlotGrid('2026-10-26', '10:30', config), true);
    assert.equal(isOnSlotGrid('2026-10-26', '10:15', config), false);
    assert.equal(isOnSlotGrid('2026-10-26', '9:00', config), false);
  });
  test('przyczyny odrzucenia', () => {
    assert.equal(evaluateSlot({ ...base, time: '10:15' }).reason, 'off_grid');
    assert.equal(evaluateSlot({ ...base, time: '09:30' }).reason, 'outside_hours');
    assert.equal(evaluateSlot({ ...base, time: '16:00' }).reason, 'outside_hours');
    assert.equal(evaluateSlot({ ...base, time: '15:30' }).ok, true);
    assert.equal(evaluateSlot({ ...base, time: '25:00' }).reason, 'invalid');
  });
  test('wynik zawiera start, koniec zabiegu i koniec bufora (po zmianie czasu: CET)', () => {
    const r = evaluateSlot({ ...base, time: '10:00' });
    assert.equal(r.start.toISOString(), '2026-10-26T09:00:00.000Z');
    assert.equal(r.end.toISOString(), '2026-10-26T11:00:00.000Z');
    assert.equal(r.blockEnd.toISOString(), '2026-10-26T11:15:00.000Z');
  });
});

describe('zmiana czasu w godzinach pracy (konfiguracja testowa: niedziela 00:00–06:00)', () => {
  const nightConfig = {
    ...config,
    workingHours: { ...config.workingHours, 0: ['00:00', '06:00'] },
    bufferMin: 0,
    minLeadHours: 0,
    maxDaysAhead: 400,
  };
  const now = new Date('2026-01-01T00:00:00Z');
  test('29.03.2026: sloty w dziurze 02:00–03:00 są odrzucane', () => {
    const slots = computeSlots({ date: '2026-03-29', durationMin: 30, now, config: nightConfig });
    assert.ok(!slots.includes('02:00'));
    assert.ok(!slots.includes('02:30'));
    assert.ok(slots.includes('01:30'));
    assert.ok(slots.includes('03:00'));
    assert.equal(evaluateSlot({ date: '2026-03-29', time: '02:30', durationMin: 30, now, config: nightConfig }).reason, 'nonexistent');
  });
  test('25.10.2026: godziny podwójne 02:00 i 02:30 są odrzucane', () => {
    const slots = computeSlots({ date: '2026-10-25', durationMin: 30, now, config: nightConfig });
    assert.ok(!slots.includes('02:00'));
    assert.ok(!slots.includes('02:30'));
    assert.ok(slots.includes('01:30'));
    assert.ok(slots.includes('03:00'));
    assert.equal(evaluateSlot({ date: '2026-10-25', time: '02:00', durationMin: 30, now, config: nightConfig }).reason, 'nonexistent');
  });
  test('zabieg przez zmianę czasu mierzony w czasie rzeczywistym (01:30 + 60 min = 03:30 CEST)', () => {
    const r = evaluateSlot({ date: '2026-03-29', time: '01:30', durationMin: 60, now, config: nightConfig });
    assert.equal(r.ok, true);
    assert.equal(r.end.getTime() - r.start.getTime(), 60 * 60_000);
  });
  test('koniec po zamknięciu (zegarowo) jest odrzucany: 05:30 + 60 min', () => {
    assert.equal(evaluateSlot({ date: '2026-03-29', time: '05:30', durationMin: 60, now, config: nightConfig }).reason, 'outside_hours');
  });
});

describe('dayRange / monthRange / eventInterval', () => {
  test('doba ma 23 h wiosną, 25 h jesienią, zwykle 24 h', () => {
    const h = (d) => {
      const r = dayRange(d, TZ);
      return (r.end - r.start) / 3_600_000;
    };
    assert.equal(h('2026-03-29'), 23);
    assert.equal(h('2026-10-25'), 25);
    assert.equal(h('2026-10-26'), 24);
    assert.equal(dayRange('2026-10-25', TZ).start.toISOString(), '2026-10-24T22:00:00.000Z');
    assert.equal(dayRange('2026-10-25', TZ).end.toISOString(), '2026-10-25T23:00:00.000Z');
    assert.equal(dayRange('bad', TZ), null);
  });
  test('monthRange', () => {
    const r = monthRange('2026-10', TZ);
    assert.equal(r.start.toISOString(), '2026-09-30T22:00:00.000Z');
    assert.equal(r.end.toISOString(), '2026-10-31T23:00:00.000Z');
  });
  test('eventInterval: wydarzenie całodniowe = doby lokalne (end.date wyłączne)', () => {
    const iv = eventInterval({ start: { date: '2026-10-26' }, end: { date: '2026-10-28' } }, TZ);
    assert.equal(new Date(iv.start).toISOString(), '2026-10-25T23:00:00.000Z');
    assert.equal(new Date(iv.end).toISOString(), '2026-10-27T23:00:00.000Z');
  });
  test('eventInterval: wydarzenie z godziną; anulowane i puste → null', () => {
    const iv = eventInterval({ start: { dateTime: '2026-10-26T10:00:00+01:00' }, end: { dateTime: '2026-10-26T11:00:00+01:00' } }, TZ);
    assert.equal(new Date(iv.start).toISOString(), '2026-10-26T09:00:00.000Z');
    assert.equal(eventInterval({ status: 'cancelled', start: { date: '2026-10-26' }, end: { date: '2026-10-27' } }, TZ), null);
    assert.equal(eventInterval({}, TZ), null);
  });
});

describe('countSlotsByDay', () => {
  test('liczy każdy dzień z jednej listy zajętości', () => {
    const dates = range(24, 30).map((d) => `2026-10-${d}`);
    const busy = [{ start: at('2026-10-27', '10:00'), end: at('2026-10-27', '18:00') }];
    const counts = countSlotsByDay({ dates, durationMin: 60, busy, now: NOW, config });
    assert.deepEqual(counts, {
      '2026-10-24': 0,
      '2026-10-25': 0,
      '2026-10-26': 14,
      '2026-10-27': 0,
      '2026-10-28': 14,
      '2026-10-29': 14,
      '2026-10-30': 14,
    });
  });
});
