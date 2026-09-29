/**
 * Generator pliku .ics (RFC 5545) – „Dodaj do kalendarza” po rezerwacji.
 * Czysty moduł: działa w przeglądarce i w Node. Czasy zapisujemy w UTC (…Z),
 * więc plik jest poprawny w każdej strefie bez sekcji VTIMEZONE.
 */

import { SITE_URL } from '../site.js';
import { BOOKING_CONFIG, SALON_LOCATION, getTreatment } from './config.js';
import { toMs, utcToZoned } from './time.js';

const CRLF = '\r\n';

/** Escapowanie tekstu wg RFC 5545 §3.3.11. */
export function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Zawijanie linii do 75 oktetów (UTF-8), kontynuacja od spacji. Nie tnie znaków wielobajtowych. */
export function foldIcsLine(line) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts = [];
  let current = '';
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    const max = parts.length === 0 ? 75 : 74; // linie kontynuacji zaczynają się od spacji
    if (bytes + size > max) {
      parts.push(current);
      current = '';
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

/** Date | ISO | ms → '20261025T090000Z' */
export function formatIcsDate(value) {
  const ms = toMs(value);
  if (!Number.isFinite(ms)) throw new TypeError('Invalid date for .ics');
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function siteHost() {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return 'localhost';
  }
}

/**
 * @param {{ uid: string, start: string|Date|number, end: string|Date|number, summary: string,
 *           description?: string, location?: string, url?: string, now?: Date|number,
 *           alarmMinutesBefore?: number | null }} event
 * @returns {string} zawartość pliku (CRLF)
 */
export function buildIcs({ uid, start, end, summary, description, location, url, now = Date.now(), alarmMinutesBefore = 24 * 60 }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AS COMPANY//Rezerwacja online//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
  ];
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  if (url) lines.push(`URL:${url}`);
  lines.push('STATUS:CONFIRMED', 'TRANSP:OPAQUE');
  if (alarmMinutesBefore) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(summary)}`,
      `TRIGGER:-PT${Math.round(alarmMinutesBefore)}M`,
      'END:VALARM'
    );
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}

/**
 * Plik .ics dla potwierdzonej wizyty (dane z odpowiedzi 201 POST /api/booking).
 * Bez danych osobowych klientki – tylko zabieg, termin i miejsce.
 * @param {{ bookingId: string, treatment: string, start: string, end: string }} booking
 */
export function buildBookingIcs({ bookingId, treatment, start, end }, { now } = {}) {
  const t = getTreatment(treatment);
  const name = t ? t.name : 'Wizyta';
  return buildIcs({
    uid: `${bookingId}@${siteHost()}`,
    start,
    end,
    summary: `${name} – AS COMPANY`,
    description: 'Wizyta zarezerwowana na stronie AS COMPANY. W razie zmian salon skontaktuje się z Tobą.',
    location: SALON_LOCATION || undefined,
    url: SITE_URL,
    now,
  });
}

/** Nazwa pliku do pobrania, np. 'wizyta-2026-10-26.ics'. */
export function icsFileName(start) {
  // ISO z offsetem ('2026-10-26T10:00:00+01:00') → data lokalna salonu z początku napisu.
  if (typeof start === 'string' && /^\d{4}-\d{2}-\d{2}/.test(start)) return `wizyta-${start.slice(0, 10)}.ics`;
  // Date / ms → data w strefie salonu (00:30 w Warszawie to jeszcze poprzedni dzień w UTC).
  const ms = toMs(start);
  const date = Number.isFinite(ms) ? utcToZoned(ms, BOOKING_CONFIG.timeZone).date : 'as-company';
  return `wizyta-${date}.ics`;
}
