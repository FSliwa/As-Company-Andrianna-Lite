/**
 * Logika rezerwacji ponad dostawcą kalendarza (serwer). Bez HTTP — testowalna
 * z dostawcą w pamięci lub atrapą.
 *
 * Zajętość = freeBusy ∪ wydarzenia z listEvents, które blokują czas (slots.js ›
 * blocksTime: bez urodzin, „miejsca pracy” i odrzuconych zaproszeń). freeBusy
 * pomija wydarzenia oznaczone „Dostępny” (transparent) — a tak domyślnie zapisują
 * się wydarzenia całodniowe w Kalendarzu Google (np. „Urlop”). Specyfikacja wymaga,
 * żeby każde takie wydarzenie blokowało sloty, więc łączymy oba źródła (równolegle).
 *
 * Zapis (createBooking) jest idempotentny: id wydarzenia pochodzi z identyfikatora
 * żądania (abuse.js › eventIdFor), więc ponowienie po timeoucie / 502 nie tworzy
 * drugiego wpisu, a „sierota” zapisana mimo błędu zostaje rozpoznana jako nasza.
 */

import crypto from 'node:crypto';
import { bookingSecret, contactHashes, eventIdFor, payloadHash } from './abuse.js';
import { BOOKING_CONFIG, SALON_LOCATION, getTreatment } from './config.js';
import {
  BookingLimitError,
  BookingPausedError,
  CalendarApiError,
  CalendarNetworkError,
  CalendarTimeoutError,
  SlotTakenError,
  describeError,
} from './errors.js';
import {
  blocksTime,
  bookingWindow,
  computeSlots,
  countSlotsByDay,
  dayRange,
  evaluateSlot,
  eventInterval,
  isDateInWindow,
  normalizeBusy,
  overlaps,
  workingHoursFor,
} from './slots.js';
import { datesOfMonth, formatIsoWithOffset, toMs } from './time.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/* ---------------- zajętość ---------------- */

/** Zajętość w przedziale [timeMin, timeMax) → posortowane [{ start, end }] (ms). */
export async function fetchBusy(provider, timeMin, timeMax, config = BOOKING_CONFIG, { signal } = {}) {
  const range = { timeMin: new Date(timeMin), timeMax: new Date(timeMax), signal };
  const [busy, events] = await Promise.all([provider.freeBusy(range), provider.listEvents(range)]);
  const out = normalizeBusy(busy);
  for (const event of events || []) {
    if (!blocksTime(event)) continue;
    const iv = eventInterval(event, config.timeZone);
    if (iv) out.push(iv);
  }
  return out.sort((a, b) => a.start - b.start);
}

/*
 * Mikro-cache dla GET: identyczne zapytania o zajętość w ciągu `config.busyCacheMs`
 * (i równoległe, jeszcze trwające) dzielą jedno wywołanie Google. Klucz = dostawca
 * + przedział. Błędy nie są zapamiętywane. POST zawsze pyta na świeżo.
 */
const busyCache = new WeakMap(); // provider → Map<key, { at, promise }>

function cachedBusy(provider, timeMin, timeMax, config, options) {
  const ttl = config.busyCacheMs || 0;
  if (!ttl) return fetchBusy(provider, timeMin, timeMax, config, options);
  let entries = busyCache.get(provider);
  if (!entries) {
    entries = new Map();
    busyCache.set(provider, entries);
  }
  const now = Date.now();
  for (const [k, v] of entries) if (now - v.at >= ttl) entries.delete(k);
  const key = `${timeMin}|${timeMax}`;
  const hit = entries.get(key);
  if (hit) return hit.promise;
  const promise = fetchBusy(provider, timeMin, timeMax, config, options);
  entries.set(key, { at: now, promise });
  promise.catch(() => {
    if (entries.get(key) && entries.get(key).promise === promise) entries.delete(key);
  });
  return promise;
}

/** Po zapisie wizyty — kolejne GET widzą ją od razu (na tej instancji). */
export function invalidateBusyCache(provider) {
  if (provider) busyCache.delete(provider);
}

/** Wolne sloty jednego dnia. Dni zamknięte / poza oknem → [] bez zapytania do kalendarza. */
export async function getDaySlots({ provider, date, treatmentId, now = new Date(), config = BOOKING_CONFIG, signal }) {
  const treatment = getTreatment(treatmentId);
  if (!treatment) return [];
  if (!workingHoursFor(date, config) || !isDateInWindow(date, now, config)) return [];
  const range = dayRange(date, config.timeZone);
  const pad = config.bufferMin * MINUTE;
  const busy = await cachedBusy(provider, range.start.getTime() - pad, range.end.getTime() + pad, config, { signal });
  return computeSlots({ date, durationMin: treatment.durationMin, busy, now, config });
}

/** Liczba wolnych slotów dla każdego dnia miesiąca — jedno zapytanie o zajętość. */
export async function getMonthAvailability({ provider, month, treatmentId, now = new Date(), config = BOOKING_CONFIG, signal }) {
  const treatment = getTreatment(treatmentId);
  const dates = datesOfMonth(month);
  const days = Object.fromEntries(dates.map((d) => [d, 0]));
  if (!treatment || !dates.length) return days;

  const { firstDate, lastDate } = bookingWindow(now, config);
  const open = dates.filter((d) => d >= firstDate && d <= lastDate && workingHoursFor(d, config));
  if (!open.length) return days;

  const pad = config.bufferMin * MINUTE;
  const from = dayRange(open[0], config.timeZone).start.getTime() - pad;
  const to = dayRange(open[open.length - 1], config.timeZone).end.getTime() + pad;
  const busy = await cachedBusy(provider, from, to, config, { signal });
  return Object.assign(days, countSlotsByDay({ dates: open, durationMin: treatment.durationMin, busy, now, config }));
}

/* ---------------- treść wydarzenia ---------------- */

/**
 * Wartość od klientki do opisu wydarzenia. Google interpretuje description jako HTML,
 * więc znaki < > zamieniamy na podobne ‹ › — żadnych znaczników ani linków <a>.
 */
function plainText(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[<>]/g, (c) => (c === '<' ? '‹' : '›'));
}

/**
 * Treść wydarzenia w Kalendarzu Google. Dane klientki tylko w opisie — BEZ attendees.
 * Uwagi stoją na końcu, za nagłówkiem, a każda ich linia zaczyna się od „│ ” — nie
 * mogą udawać linii „Telefon:” ani „ID rezerwacji”.
 */
export function buildCalendarEvent({ bookingId, eventId, treatment, input, start, end, hashes, digest, config = BOOKING_CONFIG }) {
  const tz = config.timeZone;
  const lines = [
    `Zabieg: ${treatment.name} (${treatment.durationMin} min)`,
    treatment.price ? `Cena: ${treatment.price}` : null,
    `Telefon: ${plainText(input.phone)}`,
    `E-mail: ${plainText(input.email)}`,
    '',
    `Zapis ze strony www · ID rezerwacji: ${bookingId}`,
  ];
  if (input.note) {
    lines.push('', 'Uwagi klientki (tekst z formularza):', ...plainText(input.note).split('\n').map((line) => `│ ${line}`));
  }
  const description = lines.filter((line) => line !== null).join('\n');

  const privateProps = { source: 'www', bookingId, treatment: treatment.id };
  if (hashes) Object.assign(privateProps, hashes);
  if (digest) privateProps.payloadHash = digest;

  const event = {
    summary: `Wizyta: ${treatment.name} — ${plainText(input.name)}`,
    description,
    start: { dateTime: formatIsoWithOffset(start, tz), timeZone: tz },
    end: { dateTime: formatIsoWithOffset(end, tz), timeZone: tz },
    extendedProperties: { private: privateProps },
    reminders: { useDefault: true },
    transparency: 'opaque',
  };
  if (eventId) event.id = eventId;
  if (SALON_LOCATION) event.location = SALON_LOCATION;
  if (config.eventColorId) event.colorId = String(config.eventColorId);
  return event;
}

/* ---------------- kontrola wyścigu ---------------- */

function createdMs(event) {
  const ms = Date.parse(event && event.created);
  return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
}

function privateOf(event) {
  return (event && event.extendedProperties && event.extendedProperties.private) || {};
}

/**
 * Czy nasze świeżo zapisane wydarzenie przegrywa z innym w tym samym czasie.
 * Wydarzenie wpisane ręcznie (nie z www) zawsze ma pierwszeństwo; z dwóch zapisów
 * z www wygrywa wcześniej utworzony (remis → mniejsze id). Dzięki temu dwa
 * równoległe żądania nie kasują się nawzajem — dokładnie jedno zostaje.
 * Urodziny, „miejsce pracy” i odrzucone zaproszenia nie konkurują (blocksTime).
 */
export function losesRace(ours, events, { from, to }, config = BOOKING_CONFIG) {
  for (const other of events || []) {
    if (!other || other.id === ours.id || !blocksTime(other)) continue;
    const iv = eventInterval(other, config.timeZone);
    if (!iv || !overlaps(from, to, iv.start, iv.end)) continue;
    if (privateOf(other).source !== 'www') return true;
    const a = createdMs(other);
    const b = createdMs(ours);
    if (a < b || (a === b && String(other.id) < String(ours.id))) return true;
  }
  return false;
}

/* ---------------- limity: kontakt i bezpiecznik ---------------- */

/**
 * Przyszłe (i niedawno utworzone) wizyty z www — jedno zapytanie dla limitu na kontakt,
 * bezpiecznika i rozpoznania powtórzonego żądania. Wizyta utworzona w ostatniej dobie
 * zaczyna się najwcześniej `minLeadHours` po utworzeniu, więc od `teraz − (24 h − minLead)`
 * lista obejmuje wszystkie wpisy z ostatnich 24 h.
 */
async function listWwwEvents(provider, nowMs, config, signal) {
  const back = Math.max(0, DAY - config.minLeadHours * HOUR);
  const events = await provider.listEvents({ timeMin: new Date(nowMs - back), privateProperty: { source: 'www' }, signal });
  return (events || []).filter((e) => e && e.status !== 'cancelled');
}

const FUSE_STORE = Symbol.for('as-company.booking.fuse');

function warnFuse(window, log) {
  const s = globalThis[FUSE_STORE] || (globalThis[FUSE_STORE] = { lastWarnAt: 0 });
  const now = Date.now();
  if (now - s.lastWarnAt < HOUR) return;
  s.lastWarnAt = now;
  log(`volume fuse tripped (${window}) — online booking paused`, { name: 'BookingPausedError' });
}

/** Bezpiecznik: za dużo wpisów z www w ostatniej godzinie / dobie → BookingPausedError. */
export function checkVolume(wwwEvents, nowMs, config = BOOKING_CONFIG) {
  const { maxPerHour, maxPerDay } = config.abuse || {};
  let hour = 0;
  let day = 0;
  for (const e of wwwEvents) {
    const created = Date.parse(e.created);
    if (!Number.isFinite(created)) continue;
    if (created > nowMs - HOUR) hour += 1;
    if (created > nowMs - DAY) day += 1;
  }
  if (maxPerHour && hour >= maxPerHour) return 'hour';
  if (maxPerDay && day >= maxPerDay) return 'day';
  return null;
}

/** Ile przyszłych wizyt z www ma ten sam telefon albo e-mail. */
export function activeBookingsForContact(wwwEvents, hashes, nowMs, config = BOOKING_CONFIG, exceptId = null) {
  let n = 0;
  for (const e of wwwEvents) {
    if (e.id === exceptId) continue;
    const p = privateOf(e);
    if (p.phoneHash !== hashes.phoneHash && p.emailHash !== hashes.emailHash) continue;
    const iv = eventInterval(e, config.timeZone);
    if (iv && iv.end > nowMs) n += 1;
  }
  return n;
}

/* ---------------- zapis idempotentny ---------------- */

function isRetryable(err) {
  return (
    err instanceof CalendarTimeoutError ||
    err instanceof CalendarNetworkError ||
    (err instanceof CalendarApiError && Number(err.status) >= 500)
  );
}

function isDuplicate(err) {
  return err instanceof CalendarApiError && Number(err.status) === 409;
}

async function findOwnEvent(provider, eventId, bookingId, config) {
  if (typeof provider.getEvent !== 'function') return null;
  try {
    const found = await provider.getEvent(eventId, { signal: AbortSignal.timeout(config.timeouts.afterInsertMs) });
    if (found && found.status !== 'cancelled' && privateOf(found).bookingId === bookingId) return found;
  } catch {
    /* brak odpowiedzi = nie wiemy — traktujemy jak brak wydarzenia */
  }
  return null;
}

/**
 * insertEvent z id wydarzenia: przy timeoucie / błędzie sieci / 5xx — jedna ponowna próba
 * z tym samym id; 409 (id zajęte) = wydarzenie już jest → sprawdzamy, czy to nasze.
 * Zanim oddamy błąd (→ 502), sprawdzamy, czy Google jednak nie zapisał wydarzenia.
 */
async function insertIdempotent(provider, event, { bookingId, signal, config, log }) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await provider.insertEvent(event, { signal });
    } catch (err) {
      if (isDuplicate(err)) {
        const own = await findOwnEvent(provider, event.id, bookingId, config);
        if (own) return own;
        throw new SlotTakenError('duplicate');
      }
      lastError = err;
      if (!isRetryable(err)) break;
    }
  }
  const own = await findOwnEvent(provider, event.id, bookingId, config);
  if (own) {
    log('insert recovered after error', lastError);
    return own;
  }
  throw lastError;
}

async function deleteWithRetry(provider, eventId, config, log) {
  const signal = AbortSignal.timeout(config.timeouts.afterInsertMs);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await provider.deleteEvent(eventId, { signal });
      return true;
    } catch (err) {
      if (attempt === 1 || signal.aborted) {
        log('race cleanup failed', err);
        return false;
      }
    }
  }
  return false;
}

function defaultLog(message, err) {
  console.error(`[booking] ${message}`, describeError(err));
}

/**
 * Zapis wizyty: reguły → (zajętość ‖ wizyty z www) → powtórka? → bezpiecznik → limit
 * na kontakt → zajętość slotu → insertEvent (idempotentny) → kontrola wyścigu.
 *
 * @param {{ provider: object, input: object, now?: Date, config?: object, secret?: string,
 *           newId?: () => string, log?: (msg: string, err?: unknown) => void }} args
 *   `input.requestId` (UUID z przeglądarki, jeden na próbę rezerwacji danego terminu)
 *   = identyfikator rezerwacji; bez niego — nowy losowy.
 * @returns {Promise<{ bookingId: string, treatment: string, start: string, end: string, timeZone: string }>}
 * @throws {SlotTakenError | BookingLimitError | BookingPausedError | import('./errors.js').CalendarError}
 */
export async function createBooking({
  provider,
  input,
  now = new Date(),
  config = BOOKING_CONFIG,
  secret = bookingSecret(),
  newId = () => crypto.randomUUID(),
  log = defaultLog,
}) {
  const treatment = getTreatment(input.treatment);
  if (!treatment) throw new SlotTakenError('invalid');
  const slotArgs = { date: input.date, time: input.time, durationMin: treatment.durationMin, now, config };
  const nowMs = toMs(now);

  // 1. Reguły bez I/O (godziny pracy, wyprzedzenie, okno, zmiana czasu).
  const rules = evaluateSlot({ ...slotArgs, busy: [] });
  if (!rules.ok) throw new SlotTakenError(rules.reason);

  const bookingId = input.requestId ? String(input.requestId).toLowerCase() : newId();
  const eventId = eventIdFor(bookingId, secret);
  const hashes = contactHashes(input, secret);
  const digest = payloadHash(input, secret);
  const result = {
    bookingId,
    treatment: treatment.id,
    start: formatIsoWithOffset(rules.start, config.timeZone),
    end: formatIsoWithOffset(rules.end, config.timeZone),
    timeZone: config.timeZone,
  };
  const event = buildCalendarEvent({ bookingId, eventId, treatment, input, hashes, digest, start: rules.start, end: rules.end, config });

  // 2. Zajętość slotu (z buforami) i wizyty z www — równolegle, w łącznym budżecie czasu.
  const budget = AbortSignal.timeout(config.timeouts.bookingMs);
  const from = rules.start.getTime() - config.bufferMin * MINUTE;
  const to = rules.blockEnd.getTime();
  const [busy, www] = await Promise.all([
    fetchBusy(provider, from, to, config, { signal: budget }),
    listWwwEvents(provider, nowMs, config, budget),
  ]);

  let created = null;
  const existing = www.find((e) => e.id === eventId);
  if (existing) {
    // 2a. Powtórzone żądanie (np. po 502, gdy Google jednak zapisał): to samo id rezerwacji.
    const iv = eventInterval(existing, config.timeZone);
    if (privateOf(existing).bookingId !== bookingId || !iv || iv.start !== rules.start.getTime() || iv.end !== rules.end.getTime()) {
      throw new SlotTakenError('conflict');
    }
    if (privateOf(existing).payloadHash !== digest) {
      // Klientka poprawiła dane przed ponowieniem — aktualizujemy opis zamiast tworzyć drugi wpis.
      const { summary, description, extendedProperties } = event;
      await provider.patchEvent(eventId, { summary, description, extendedProperties }, { signal: budget });
    }
    created = existing;
  } else {
    // 2b. Bezpiecznik dla całej strony.
    const tripped = checkVolume(www, nowMs, config);
    if (tripped) {
      warnFuse(tripped, log);
      throw new BookingPausedError(tripped);
    }
    // 2c. Limit przyszłych wizyt na ten sam telefon albo e-mail.
    const limit = config.abuse && config.abuse.maxActivePerContact;
    if (limit && activeBookingsForContact(www, hashes, nowMs, config) >= limit) throw new BookingLimitError();
    // 2d. Zajętość slotu.
    const check = evaluateSlot({ ...slotArgs, busy, busyNormalized: true });
    if (!check.ok) throw new SlotTakenError(check.reason);

    // 3. Zapis (idempotentny).
    created = await insertIdempotent(provider, event, { bookingId, signal: budget, config, log });
  }
  invalidateBusyCache(provider);

  // 4. Kontrola wyścigu: ktoś (albo właścicielka) zajął ten czas między 2. a 3.
  let events = null;
  try {
    events = await provider.listEvents({
      timeMin: new Date(from),
      timeMax: new Date(to),
      signal: AbortSignal.timeout(config.timeouts.afterInsertMs),
    });
  } catch (err) {
    // Wydarzenie jest już zapisane, a wstępna kontrola przeszła — nie cofamy rezerwacji.
    log('race check skipped', err);
  }
  if (events && created && losesRace(created, events, { from, to }, config)) {
    await deleteWithRetry(provider, created.id, config, log);
    throw new SlotTakenError('race');
  }

  return result;
}
