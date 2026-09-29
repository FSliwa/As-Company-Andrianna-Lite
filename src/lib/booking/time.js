/**
 * Czyste funkcje strefy czasowej (bez zależności) — testowalne `node --test`.
 *
 * Daty lokalne salonu to napisy 'YYYY-MM-DD', godziny 'HH:MM'. Konwersja
 * czas lokalny → UTC używa offsetu z Intl.DateTimeFormat (`timeZoneName:
 * 'longOffset'`), więc poprawnie obsługuje czas letni/zimowy:
 *  - godziny „nieistniejące” (dziura przy zmianie na czas letni, np. 29.03.2026
 *    02:00–03:00 w Warszawie) → null,
 *  - godziny „podwójne” (25.10.2026 02:00–03:00) → wybór wg `disambiguation`.
 */

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/* ---------------- parsowanie / formatowanie ---------------- */

/** 'YYYY-MM-DD' → { y, m, d } albo null (także dla nieistniejących dat, np. 2026-02-30). */
export function parseDate(str) {
  if (typeof str !== 'string') return null;
  const match = DATE_RE.exec(str);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1970 || y > 9999 || m < 1 || m > 12 || d < 1) return null;
  if (d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function isValidDate(str) {
  return parseDate(str) !== null;
}

/** 'YYYY-MM' → { y, m } albo null. */
export function parseMonth(str) {
  if (typeof str !== 'string') return null;
  const match = MONTH_RE.exec(str);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  if (y < 1970 || y > 9999 || m < 1 || m > 12) return null;
  return { y, m };
}

/** 'HH:MM' → minuty od północy albo null. */
export function parseTime(str) {
  if (typeof str !== 'string') return null;
  const match = TIME_RE.exec(str);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** minuty od północy → 'HH:MM' */
export function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatYmd(y, m, d) {
  return `${String(y).padStart(4, '0')}-${pad2(m)}-${pad2(d)}`;
}

/** Dzień tygodnia daty kalendarzowej (0 = niedziela). */
export function weekdayOf(dateStr) {
  const p = parseDate(dateStr);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
}

/** Dodaje dni do daty kalendarzowej (bez udziału stref). */
export function addDays(dateStr, days) {
  const p = parseDate(dateStr);
  if (!p) return null;
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d) + days * DAY);
  return formatYmd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** Liczba dni kalendarzowych od `a` do `b` (b − a). */
export function diffDays(a, b) {
  const pa = parseDate(a);
  const pb = parseDate(b);
  if (!pa || !pb) return null;
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / DAY);
}

/** Wszystkie daty miesiąca 'YYYY-MM'. */
export function datesOfMonth(monthStr) {
  const p = parseMonth(monthStr);
  if (!p) return [];
  const out = [];
  for (let d = 1; d <= daysInMonth(p.y, p.m); d += 1) out.push(formatYmd(p.y, p.m, d));
  return out;
}

/* ---------------- Intl: offset strefy ---------------- */

const offsetFormatters = new Map();
const partsFormatters = new Map();

function offsetFormatter(timeZone) {
  let f = offsetFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' });
    offsetFormatters.set(timeZone, f);
  }
  return f;
}

function partsFormatter(timeZone) {
  let f = partsFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    partsFormatters.set(timeZone, f);
  }
  return f;
}

/** Czy strefa jest znana środowisku (np. 'Europe/Warsaw'). */
export function isValidTimeZone(timeZone) {
  try {
    offsetFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset strefy (minuty na wschód od UTC) w danej chwili.
 * 'GMT+02:00' → 120, 'GMT-03:30' → -210, 'GMT' → 0.
 */
export function getOffsetMinutes(instant, timeZone) {
  const date = instant instanceof Date ? instant : new Date(instant);
  const part = offsetFormatter(timeZone)
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName');
  const value = part ? part.value : 'GMT';
  if (value === 'GMT' || value === 'UTC') return 0;
  const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(value);
  if (!match) throw new Error(`Unrecognised offset: ${value}`);
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] || 0));
}

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/**
 * Chwila (Date | ms) → czas lokalny w strefie:
 * { date: 'YYYY-MM-DD', time: 'HH:MM', minutes, weekday, offsetMinutes }.
 */
export function utcToZoned(instant, timeZone) {
  const date = instant instanceof Date ? instant : new Date(instant);
  const parts = {};
  for (const p of partsFormatter(timeZone).formatToParts(date)) parts[p.type] = p.value;
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: formatMinutes(hour * 60 + minute),
    minutes: hour * 60 + minute,
    weekday: WEEKDAYS[parts.weekday],
    offsetMinutes: getOffsetMinutes(date, timeZone),
  };
}

/** Dzisiejsza data w strefie salonu. */
export function todayInZone(now, timeZone) {
  return utcToZoned(now, timeZone).date;
}

/**
 * Czas lokalny (data + godzina w strefie) → Date (UTC) albo null.
 *
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {string} timeStr 'HH:MM'
 * @param {string} timeZone np. 'Europe/Warsaw'
 * @param {{ disambiguation?: 'earlier' | 'later' | 'reject' }} [options]
 *   dla godzin „podwójnych” (cofnięcie zegara): 'earlier' (domyślnie — pierwsze
 *   wystąpienie, jeszcze czas letni), 'later' albo 'reject' (null).
 * @returns {Date | null} null dla złego formatu lub godziny nieistniejącej (dziura DST).
 */
export function zonedToUtc(dateStr, timeStr, timeZone, options = {}) {
  const disambiguation = options.disambiguation || 'earlier';
  const p = parseDate(dateStr);
  const minutes = parseTime(timeStr);
  if (!p || minutes === null) return null;

  // Czas lokalny „udający” UTC — od niego odejmujemy kandydackie offsety.
  const wall = Date.UTC(p.y, p.m - 1, p.d, Math.floor(minutes / 60), minutes % 60);

  // Offsety strefy dobę przed i dobę po obejmują obie strony ewentualnej zmiany czasu.
  const offsets = new Set([getOffsetMinutes(wall - DAY, timeZone), getOffsetMinutes(wall + DAY, timeZone)]);
  offsets.add(getOffsetMinutes(wall, timeZone));

  const candidates = [];
  for (const off of offsets) {
    const utc = wall - off * MINUTE;
    // Kandydat jest poprawny, jeśli w tej chwili strefa naprawdę ma ten offset.
    if (getOffsetMinutes(utc, timeZone) === off) candidates.push(utc);
  }
  const unique = [...new Set(candidates)].sort((a, b) => a - b);

  if (unique.length === 0) return null; // dziura — godzina nie istnieje
  if (unique.length > 1) {
    if (disambiguation === 'reject') return null;
    return new Date(disambiguation === 'later' ? unique[unique.length - 1] : unique[0]);
  }
  return new Date(unique[0]);
}

/** Czy lokalna godzina występuje dwukrotnie (cofnięcie zegara). */
export function isAmbiguousLocalTime(dateStr, timeStr, timeZone) {
  const a = zonedToUtc(dateStr, timeStr, timeZone, { disambiguation: 'earlier' });
  const b = zonedToUtc(dateStr, timeStr, timeZone, { disambiguation: 'later' });
  return Boolean(a && b && a.getTime() !== b.getTime());
}

/** Date → '2026-10-25T10:00:00+01:00' (ISO 8601 z offsetem strefy). */
export function formatIsoWithOffset(instant, timeZone) {
  const date = instant instanceof Date ? instant : new Date(instant);
  const local = utcToZoned(date, timeZone);
  const off = local.offsetMinutes;
  const sign = off < 0 ? '-' : '+';
  const abs = Math.abs(off);
  const seconds = pad2(Math.floor((date.getTime() % MINUTE + MINUTE) % MINUTE / 1000));
  return `${local.date}T${local.time}:${seconds}${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

/** Wartość czasu (ISO | Date | ms) → ms albo NaN. */
export function toMs(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Date.parse(value);
  return NaN;
}
