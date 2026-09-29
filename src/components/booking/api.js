/**
 * Klient API rezerwacji (przeglądarka).
 *
 * Każda odpowiedź sprowadzana jest do jednego kształtu:
 *   { ok: true, status, data }  albo  { ok: false, status, error, fields?, retryAfter? }
 * gdzie `error` to kod z API ('disabled', 'paused', 'rate_limited', 'calendar', 'taken',
 * 'limit', 'invalid', 'too_fast', 'form_expired', 'captcha', 'forbidden', …) albo
 * 'network' (brak połączenia).
 * Przerwane żądanie (AbortController) rzuca AbortError — wywołujący je pomija.
 *
 * Krótki cache w pamięci karty ogranicza liczbę zapytań przy przełączaniu
 * zabiegów strzałkami (limit API: 60 GET / min).
 */

const cache = new Map();
const TTL_MS = { month: 60 * 1000, day: 20 * 1000 };

async function requestJson(url, init = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...init,
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(init.headers || {}) },
    });
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    return { ok: false, status: 0, error: 'network' };
  }

  let body = null;
  try {
    body = await res.json();
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    body = null;
  }

  if (res.ok && body && typeof body === 'object') return { ok: true, status: res.status, data: body };

  const retry = Number(res.headers.get('retry-after'));
  return {
    ok: false,
    status: res.status,
    error: (body && typeof body.error === 'string' && body.error) || (res.status >= 500 ? 'server' : 'unknown'),
    fields: body && Array.isArray(body.fields) ? body.fields : undefined,
    retryAfter: Number.isFinite(retry) && retry > 0 ? retry : undefined,
  };
}

async function cachedGet(key, ttl, url, { signal, force = false } = {}) {
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < ttl) return hit.result;
  const result = await requestJson(url, { signal });
  if (result.ok) cache.set(key, { at: Date.now(), result });
  return result;
}

/** GET /api/booking/slots?month=YYYY-MM → data.days { 'YYYY-MM-DD': liczbaSlotów } */
export function fetchMonthAvailability(treatment, month, options) {
  const qs = new URLSearchParams({ month, treatment });
  return cachedGet(`m|${treatment}|${month}`, TTL_MS.month, `/api/booking/slots?${qs}`, options);
}

/** GET /api/booking/slots?date=YYYY-MM-DD → data.slots ['10:00', …] */
export function fetchDaySlots(treatment, date, options) {
  const qs = new URLSearchParams({ date, treatment });
  return cachedGet(`d|${treatment}|${date}`, TTL_MS.day, `/api/booking/slots?${qs}`, options);
}

/** Po 409 (termin się zajął) — świeże dane dla zabiegu. */
export function invalidateAvailability(treatment) {
  for (const key of cache.keys()) {
    if (key.split('|')[1] === treatment) cache.delete(key);
  }
}

/**
 * UUID jednej próby rezerwacji (idempotentny zapis: ponowienie po błędzie z tym samym
 * identyfikatorem nie tworzy drugiego wpisu). crypto.randomUUID wymaga bezpiecznego
 * kontekstu — w podglądzie przez http://192.168… używamy getRandomValues.
 */
export function newRequestId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** POST /api/booking → 201 { bookingId, treatment, start, end, timeZone } */
export function postBooking(payload, { signal } = {}) {
  return requestJson('/api/booking', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
