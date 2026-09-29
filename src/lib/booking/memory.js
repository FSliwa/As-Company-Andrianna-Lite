/**
 * Dostawca kalendarza W PAMIĘCI — tylko dev/test. Ten sam interfejs co google.js
 * (freeBusy / listEvents / getEvent / insertEvent / patchEvent / deleteEvent).
 * W production odmawia działania. Jak Google: id usuniętego wydarzenia nie da się
 * użyć ponownie (409), a getEvent zwraca je ze statusem 'cancelled'.
 *
 * Zawiera kilka przykładowych zajętości względem „teraz” (najbliższe dni robocze
 * po okresie wyprzedzenia), w tym całodniowy „urlop” oznaczony jako Dostępny
 * (transparent) — freeBusy go pomija, listEvents nie, jak w prawdziwym Google.
 */

import crypto from 'node:crypto';
import { CalendarApiError } from './errors.js';
import { blocksTime, eventInterval } from './slots.js';
import { addDays, todayInZone, toMs, weekdayOf, zonedToUtc } from './time.js';

export function assertNotProduction(env = process.env) {
  if (env.NODE_ENV === 'production') {
    throw new Error('The in-memory booking provider is disabled in production');
  }
}

function timedEvent(id, date, from, to, timeZone, extra = {}) {
  return {
    id,
    status: 'confirmed',
    summary: 'Przykład (memory)',
    start: { dateTime: zonedToUtc(date, from, timeZone).toISOString(), timeZone },
    end: { dateTime: zonedToUtc(date, to, timeZone).toISOString(), timeZone },
    created: new Date(0).toISOString(),
    ...extra,
  };
}

/** Przykładowe zajętości w najbliższych dniach roboczych (pon–pt) od pojutrza. */
export function sampleEvents(nowMs, timeZone) {
  const days = [];
  let d = addDays(todayInZone(nowMs, timeZone), 2);
  while (days.length < 4) {
    const wd = weekdayOf(d);
    if (wd >= 1 && wd <= 5) days.push(d);
    d = addDays(d, 1);
  }
  return [
    timedEvent('sample1', days[0], '12:00', '14:00', timeZone),
    timedEvent('sample2', days[1], '10:00', '11:30', timeZone),
    timedEvent('sample3', days[1], '15:00', '18:00', timeZone),
    {
      id: 'sample4',
      status: 'confirmed',
      summary: 'Urlop (przykład, całodniowe, „Dostępny”)',
      start: { date: days[2] },
      end: { date: addDays(days[2], 1) },
      transparency: 'transparent',
      created: new Date(0).toISOString(),
    },
    timedEvent('sample5', days[3], '10:00', '18:00', timeZone),
  ];
}

function pick(event) {
  const copy = JSON.parse(JSON.stringify(event));
  const { id, status, start, end, transparency, created, extendedProperties, eventType, attendees } = copy;
  return { id, status, start, end, transparency, created, extendedProperties, eventType, attendees };
}

function matchesPrivate(event, privateProperty) {
  if (!privateProperty) return true;
  const props = (event.extendedProperties && event.extendedProperties.private) || {};
  return Object.entries(privateProperty).every(([k, v]) => props[k] === String(v));
}

const EVENT_ID_RE = /^[a-v0-9]{5,1024}$/;

/**
 * @param {{ now?: () => number, timeZone?: string, seed?: boolean, env?: object }} [options]
 */
export function createMemoryCalendar({
  now = () => Date.now(),
  timeZone = 'Europe/Warsaw',
  seed = true,
  env = process.env,
} = {}) {
  assertNotProduction(env);

  const events = new Map();
  const deleted = new Set();
  if (seed) for (const e of sampleEvents(now(), timeZone)) events.set(e.id, e);

  function overlapping(timeMin, timeMax) {
    const from = toMs(timeMin);
    const to = timeMax === undefined || timeMax === null ? Number.POSITIVE_INFINITY : toMs(timeMax);
    return [...events.values()]
      .map((e) => ({ e, iv: eventInterval(e, timeZone) }))
      .filter(({ iv }) => iv && iv.start < to && from < iv.end)
      .sort((a, b) => a.iv.start - b.iv.start);
  }

  return {
    kind: 'memory',

    async freeBusy({ timeMin, timeMax }) {
      const from = toMs(timeMin);
      const to = toMs(timeMax);
      const merged = [];
      for (const { e, iv } of overlapping(timeMin, timeMax)) {
        // Jak Google: „Dostępny” (w tym urodziny) i odrzucone zaproszenia nie blokują w freeBusy.
        if (e.transparency === 'transparent' || !blocksTime(e)) continue;
        const s = Math.max(iv.start, from);
        const en = Math.min(iv.end, to);
        const last = merged[merged.length - 1];
        if (last && s <= last.end) last.end = Math.max(last.end, en);
        else merged.push({ start: s, end: en });
      }
      return merged.map((b) => ({ start: new Date(b.start).toISOString(), end: new Date(b.end).toISOString() }));
    },

    async listEvents({ timeMin, timeMax, privateProperty }) {
      return overlapping(timeMin, timeMax)
        .filter(({ e }) => matchesPrivate(e, privateProperty))
        .map(({ e }) => pick(e));
    },

    async getEvent(eventId) {
      if (events.has(eventId)) return pick(events.get(eventId));
      if (deleted.has(eventId)) return { id: eventId, status: 'cancelled' };
      return null;
    },

    async insertEvent(event) {
      if (!event || !event.start || !event.end) throw new TypeError('Event requires start and end');
      let id = crypto.randomBytes(16).toString('hex');
      if (event.id !== undefined) {
        if (!EVENT_ID_RE.test(String(event.id))) throw new CalendarApiError('Invalid event id', { status: 400, reason: 'invalid' });
        if (events.has(event.id) || deleted.has(event.id)) {
          throw new CalendarApiError('The requested identifier already exists', { status: 409, reason: 'duplicate' });
        }
        id = event.id;
      }
      const stored = { ...JSON.parse(JSON.stringify(event)), id, status: 'confirmed', created: new Date(now()).toISOString() };
      if (!eventInterval(stored, timeZone)) throw new TypeError('Event has an invalid time range');
      events.set(id, stored);
      return { id, status: stored.status, start: stored.start, end: stored.end, created: stored.created };
    },

    async patchEvent(eventId, patch) {
      const current = events.get(eventId);
      if (!current) throw new CalendarApiError('Not found', { status: 404, reason: 'notFound' });
      const next = { ...current, ...JSON.parse(JSON.stringify(patch)), id: eventId, created: current.created };
      events.set(eventId, next);
      return { id: eventId, status: next.status, start: next.start, end: next.end, created: next.created };
    },

    async deleteEvent(eventId) {
      if (events.delete(eventId)) deleted.add(eventId);
    },

    /** Tylko testy/dev: kopia wszystkich wydarzeń. */
    snapshot() {
      return [...events.values()].map((e) => JSON.parse(JSON.stringify(e)));
    },
  };
}
