/**
 * Formatowanie dat i godzin rezerwacji po polsku — deterministycznie (bez Intl
 * z lokalną strefą przeglądarki): daty to napisy 'YYYY-MM-DD' w czasie salonu.
 */

import { BOOKING_CONFIG } from '@/lib/booking/config';
import { addDays, formatMinutes, parseDate, parseTime, utcToZoned, weekdayOf, zonedToUtc } from '@/lib/booking/time';

const WEEKDAY_LONG = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const WEEKDAY_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
const MONTH_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];
const MONTH_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

/** 'YYYY-MM-DD' → części do wyświetlenia albo null. */
export function describeDate(dateStr) {
  const p = parseDate(dateStr);
  if (!p) return null;
  const wd = weekdayOf(dateStr);
  return {
    day: p.d,
    year: p.y,
    weekday: WEEKDAY_LONG[wd],
    weekdayShort: WEEKDAY_SHORT[wd],
    month: MONTH_GENITIVE[p.m - 1],
    monthShort: MONTH_SHORT[p.m - 1],
  };
}

/** 'czwartek, 1 października' (+ ' 2026' z opcją year). */
export function formatDateLong(dateStr, { year = false } = {}) {
  const d = describeDate(dateStr);
  if (!d) return '';
  return `${d.weekday}, ${d.day} ${d.month}${year ? ` ${d.year}` : ''}`;
}

/**
 * '14:30' + 120 min → '14:30–16:30'. Z datą koniec liczony w czasie rzeczywistym strefy
 * salonu (jak na serwerze) — w noc zmiany czasu 01:30 + 60 min = 03:30, nie 02:30.
 */
export function timeRange(time, durationMin, date = null, timeZone = BOOKING_CONFIG.timeZone) {
  const start = parseTime(time);
  if (start === null) return '';
  if (!(durationMin > 0)) return time;
  const startUtc = date ? zonedToUtc(date, time, timeZone) : null;
  if (startUtc) return `${time}–${utcToZoned(startUtc.getTime() + durationMin * 60 * 1000, timeZone).time}`;
  return `${time}–${formatMinutes(start + durationMin)}`;
}

/** Czy przeglądarka działa w innej strefie niż salon (tylko po stronie klienta). */
export function browserTimeZoneDiffers(timeZone = BOOKING_CONFIG.timeZone) {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone !== timeZone;
  } catch {
    return false;
  }
}

export const SALON_TIME_NOTE = 'Godziny w czasie polskim (Warszawa).';

export function formatDuration(min) {
  return `${min} min`;
}

/** Wszystkie daty od `from` do `to` włącznie. */
export function datesBetween(from, to) {
  const out = [];
  if (!parseDate(from) || !parseDate(to)) return out;
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Miesiące 'YYYY-MM', które obejmuje zakres dat. */
export function monthsBetween(from, to) {
  const months = new Set();
  for (const d of datesBetween(from, to)) months.add(d.slice(0, 7));
  return [...months];
}

/** Polska odmiana liczebnika: 1 godzina, 2 godziny, 5 godzin. */
export function plural(n, one, few, many) {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
