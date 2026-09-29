/**
 * Czyste funkcje dostępności terminów (bez I/O) — testowalne `node --test`.
 *
 * Zasady (wszystko w czasie lokalnym salonu, `config.timeZone`):
 *  - slot startuje na siatce `slotStepMin` liczonej od otwarcia danego dnia,
 *  - zabieg + bufor (`durationMin + bufferMin`) mieści się w godzinach pracy,
 *  - przedziały zajętości są półotwarte [start, end); każdy zajęty przedział ma
 *    po sobie `bufferMin` wolnego, a nasz zabieg też ma bufor po sobie — kolizja
 *    zachodzi, gdy [start − bufor, start + zabieg + bufor) nachodzi na [bStart, bEnd),
 *  - start ≥ teraz + `minLeadHours`, data ≤ dzisiaj + `maxDaysAhead`,
 *  - dni zamknięte (godziny null lub `closedDates`) nie mają slotów,
 *  - godziny nieistniejące i podwójne (zmiana czasu) są odrzucane.
 */

import {
  addDays,
  datesOfMonth,
  formatMinutes,
  parseDate,
  parseTime,
  toMs,
  todayInZone,
  utcToZoned,
  weekdayOf,
  zonedToUtc,
} from './time.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** Półotwarte przedziały [aStart, aEnd) i [bStart, bEnd) nachodzą na siebie. */
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Lista zajętości (ISO | Date | ms) → posortowane [{ start, end }] w ms.
 * Pomija wpisy nieprawidłowe i puste.
 */
export function normalizeBusy(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((b) => ({ start: toMs(b && b.start), end: toMs(b && b.end) }))
    .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end) && b.end > b.start)
    .sort((a, b) => a.start - b.start);
}

/** Godziny pracy danego dnia w minutach od północy albo null (zamknięte / zła data). */
export function workingHoursFor(dateStr, config) {
  if (!parseDate(dateStr)) return null;
  if (config.closedDates && config.closedDates.includes(dateStr)) return null;
  const hours = config.workingHours[weekdayOf(dateStr)];
  if (!hours) return null;
  const open = parseTime(hours[0]);
  const close = parseTime(hours[1]);
  if (open === null || close === null || close <= open) return null;
  return { open, close };
}

/**
 * Okno rezerwacji względem `now`:
 *  earliestStart — najwcześniejsza chwila startu (ms),
 *  firstDate — data lokalna tej chwili, lastDate — dzisiaj + maxDaysAhead.
 */
export function bookingWindow(now, config) {
  const nowMs = toMs(now);
  const earliestStart = nowMs + config.minLeadHours * HOUR;
  return {
    earliestStart,
    firstDate: utcToZoned(earliestStart, config.timeZone).date,
    lastDate: addDays(todayInZone(nowMs, config.timeZone), config.maxDaysAhead),
  };
}

/** Czy data mieści się w oknie rezerwacji (porównanie dat kalendarzowych). */
export function isDateInWindow(dateStr, now, config) {
  if (!parseDate(dateStr)) return false;
  const { firstDate, lastDate } = bookingWindow(now, config);
  return dateStr >= firstDate && dateStr <= lastDate;
}

/** Początek doby lokalnej (pierwsza istniejąca minuta). */
function startOfLocalDay(dateStr, timeZone) {
  for (let m = 0; m < 24 * 60; m += 15) {
    const d = zonedToUtc(dateStr, formatMinutes(m), timeZone, { disambiguation: 'earlier' });
    if (d) return d;
  }
  return null;
}

/**
 * Doba lokalna jako przedział UTC [start, end) — w dni zmiany czasu ma 23 lub 25 h.
 * @returns {{ start: Date, end: Date } | null}
 */
export function dayRange(dateStr, timeZone) {
  if (!parseDate(dateStr)) return null;
  const start = startOfLocalDay(dateStr, timeZone);
  const end = startOfLocalDay(addDays(dateStr, 1), timeZone);
  return start && end ? { start, end } : null;
}

/** Miesiąc 'YYYY-MM' jako przedział UTC [start, end). */
export function monthRange(monthStr, timeZone) {
  const dates = datesOfMonth(monthStr);
  if (!dates.length) return null;
  const first = dayRange(dates[0], timeZone);
  const last = dayRange(dates[dates.length - 1], timeZone);
  return first && last ? { start: first.start, end: last.end } : null;
}


/** Czy godzina leży na siatce slotów danego dnia (od otwarcia, co `slotStepMin`). */
export function isOnSlotGrid(dateStr, timeStr, config) {
  const minutes = parseTime(timeStr);
  if (minutes === null || !parseDate(dateStr)) return false;
  const hours = workingHoursFor(dateStr, config);
  const base = hours ? hours.open : 0;
  return (((minutes - base) % config.slotStepMin) + config.slotStepMin) % config.slotStepMin === 0;
}

/** Czy zabieg startujący w `startMs` koliduje z zajętością (z buforami). */
export function conflictsWithBusy(startMs, durationMin, bufferMin, busy) {
  const from = startMs - bufferMin * MINUTE;
  const to = startMs + (durationMin + bufferMin) * MINUTE;
  return busy.some((b) => overlaps(from, to, b.start, b.end));
}

/**
 * Ocena jednego slotu.
 * @param {{ date: string, time: string, durationMin: number, busy?: Array, now: Date|number,
 *           config: object, busyNormalized?: boolean }} args
 * @returns {{ ok: boolean, reason: null | 'invalid' | 'closed' | 'off_grid' | 'outside_hours'
 *            | 'nonexistent' | 'too_soon' | 'too_far' | 'busy', start?: Date, end?: Date, blockEnd?: Date }}
 */
export function evaluateSlot({ date, time, durationMin, busy = [], now, config, busyNormalized = false }) {
  const minutes = parseTime(time);
  if (!parseDate(date) || minutes === null || !(durationMin > 0)) return { ok: false, reason: 'invalid' };

  const hours = workingHoursFor(date, config);
  if (!hours) return { ok: false, reason: 'closed' };
  if (!isOnSlotGrid(date, time, config)) return { ok: false, reason: 'off_grid' };
  if (minutes < hours.open) return { ok: false, reason: 'outside_hours' };

  // Godziny nieistniejące (dziura) i podwójne (cofnięcie zegara) odrzucamy.
  const start = zonedToUtc(date, time, config.timeZone, { disambiguation: 'reject' });
  if (!start) return { ok: false, reason: 'nonexistent' };

  const startMs = start.getTime();
  const end = new Date(startMs + durationMin * MINUTE);
  const blockEnd = new Date(startMs + (durationMin + config.bufferMin) * MINUTE);

  // Zabieg + bufor musi skończyć się tego samego dnia, najpóźniej o zamknięciu (czas zegarowy).
  const endLocal = utcToZoned(blockEnd, config.timeZone);
  if (endLocal.date !== date || endLocal.minutes > hours.close) {
    return { ok: false, reason: 'outside_hours', start, end, blockEnd };
  }

  const window = bookingWindow(now, config);
  if (date > window.lastDate) return { ok: false, reason: 'too_far', start, end, blockEnd };
  if (startMs < window.earliestStart) return { ok: false, reason: 'too_soon', start, end, blockEnd };

  const list = busyNormalized ? busy : normalizeBusy(busy);
  if (conflictsWithBusy(startMs, durationMin, config.bufferMin, list)) {
    return { ok: false, reason: 'busy', start, end, blockEnd };
  }
  return { ok: true, reason: null, start, end, blockEnd };
}

export function isSlotAvailable(args) {
  return evaluateSlot(args).ok;
}

/**
 * Wolne sloty dnia → ['10:00', '10:30', …].
 * @param {{ date: string, durationMin: number, busy?: Array, now: Date|number, config: object }} args
 */
export function computeSlots({ date, durationMin, busy = [], now, config }) {
  const hours = workingHoursFor(date, config);
  if (!hours || !(durationMin > 0)) return [];
  if (!isDateInWindow(date, now, config)) return [];
  const list = normalizeBusy(busy);
  const out = [];
  for (let m = hours.open; m < hours.close; m += config.slotStepMin) {
    const time = formatMinutes(m);
    if (evaluateSlot({ date, time, durationMin, busy: list, busyNormalized: true, now, config }).ok) out.push(time);
  }
  return out;
}

/** Liczba wolnych slotów dla wielu dni (np. miesiąc) przy jednym zapytaniu o zajętość. */
export function countSlotsByDay({ dates, durationMin, busy = [], now, config }) {
  const list = normalizeBusy(busy);
  const out = {};
  for (const date of dates) {
    out[date] = computeSlots({ date, durationMin, busy: list, now, config }).length;
  }
  return out;
}

/**
 * Typy wydarzeń, które Google dopisuje sam i które NIE są zajętością salonu:
 * urodziny (z Kontaktów Google i z profilu konta — całodniowe, co roku) oraz
 * dzienne „miejsce pracy” w Workspace. Ręczny „Urlop” (typ 'default') blokuje
 * zawsze — także oznaczony jako „Dostępny” — bo filtrujemy po typie, nie po transparency.
 */
const NON_BLOCKING_EVENT_TYPES = new Set(['birthday', 'workingLocation']);

/** Czy wydarzenie z kalendarza blokuje terminy. */
export function blocksTime(event) {
  if (!event || event.status === 'cancelled') return false;
  if (NON_BLOCKING_EVENT_TYPES.has(event.eventType)) return false;
  // Zaproszenie odrzucone przez właścicielkę kalendarza (freeBusy też go nie liczy).
  if (Array.isArray(event.attendees) && event.attendees.some((a) => a && a.self && a.responseStatus === 'declined')) {
    return false;
  }
  return true;
}

/**
 * Wydarzenie z Kalendarza Google → przedział [start, end) w ms albo null.
 * Wydarzenia całodniowe ({ date }) zajmują całe doby lokalne salonu
 * (end.date jest wyłączne, jak w API Google). Anulowane → null.
 */
export function eventInterval(event, timeZone) {
  if (!event || event.status === 'cancelled' || !event.start || !event.end) return null;
  let start;
  let end;
  if (event.start.dateTime) {
    start = toMs(event.start.dateTime);
    end = toMs(event.end.dateTime);
  } else if (event.start.date) {
    const s = dayRange(event.start.date, timeZone);
    const e = dayRange(event.end.date, timeZone);
    start = s ? s.start.getTime() : NaN;
    end = e ? e.start.getTime() : NaN;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start, end };
}
