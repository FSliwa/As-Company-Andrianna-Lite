/**
 * Logika HTTP tras /api/booking – oddzielona od plików route.js, żeby dało się
 * ją testować `node --test` (standardowe Request/Response, bez next/server).
 *
 * Kody odpowiedzi:
 *   GET  200 | 400 invalid | 403 forbidden | 429 rate_limited | 502 calendar | 503 disabled | 500 server
 *   POST 201 | 400 invalid / too_fast / form_expired / captcha | 403 forbidden | 409 taken / limit
 *        | 413 too_large | 415 unsupported_media_type | 429 rate_limited | 502 calendar / captcha
 *        | 503 disabled / paused | 500 server
 *
 * W logach wyłącznie nazwa/rodzaj błędu i status – nigdy dane osobowe, IP ani klucz.
 *
 * Rezerwacja zbiera dane osobowe, więc domyślny dostawca jest dostępny tylko, gdy
 * dokumenty prawne są publiczne (LEGAL_PUBLIC, src/lib/legal.js – decyzja Filipa
 * z 30.09.2026: także przed uzupełnieniem danych firmy) – inaczej 503 disabled,
 * tak jak przy braku konfiguracji kalendarza. Testy podają własne `getProvider`.
 */

import { bookingSecret, checkFormToken, turnstileKeys, verifyTurnstile } from './abuse.js';
import { BOOKING_CONFIG } from './config.js';
import {
  BookingError,
  BookingLimitError,
  BookingPausedError,
  CalendarError,
  SlotTakenError,
  describeError,
} from './errors.js';
import { LEGAL_PUBLIC } from '../legal.js';
import { getBookingProvider } from './provider.js';
import { clientKey, sharedLimiter } from './ratelimit.js';
import { bookingSchema, issueFields, parseSlotsQuery } from './schema.js';
import { createBooking, getDaySlots, getMonthAvailability } from './service.js';

const BASE_HEADERS = Object.freeze({
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
});

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...headers } });
}

function logError(message, err) {
  console.error(`[booking] ${message}`, describeError(err));
}

/* ---------------- Origin / Host ---------------- */

function hostOf(value) {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

/** Hosty, z których wolno wysyłać żądania: Host, X-Forwarded-Host, adres serwisu, BOOKING_ALLOWED_ORIGINS. */
export function allowedHosts(request, env = process.env) {
  const hosts = new Set();
  const add = (h) => {
    const v = (h || '').trim().toLowerCase();
    if (v) hosts.add(v);
  };
  add(request.headers.get('host'));
  (request.headers.get('x-forwarded-host') || '').split(',').forEach(add);
  add(hostOf(request.url));
  add(hostOf(env.NEXT_PUBLIC_SITE_URL));
  (env.BOOKING_ALLOWED_ORIGINS || '').split(',').forEach((o) => add(hostOf(o.trim())));
  return hosts;
}

/**
 * Origin (albo Referer) musi wskazywać ten sam host. Dla POST nagłówek jest
 * wymagany (przeglądarki zawsze go wysyłają), dla GET – tylko gdy obecny.
 */
export function isAllowedOrigin(request, { required, env = process.env }) {
  if ((request.headers.get('sec-fetch-site') || '').toLowerCase() === 'cross-site') return false;
  const origin = request.headers.get('origin');
  let source = null;
  if (origin !== null) {
    if (origin === 'null') return false;
    source = hostOf(origin);
    if (!source) return false;
  } else {
    source = hostOf(request.headers.get('referer'));
  }
  if (!source) return !required;
  return allowedHosts(request, env).has(source);
}

/* ---------------- body ---------------- */

/** Czyta body z limitem bajtów (strumieniowo – nie wczytuje całego nadmiarowego body). */
export async function readBodyLimited(request, maxBytes) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false };
  if (!request.body) return { ok: true, text: '' };
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      return { ok: false };
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return { ok: true, text: new TextDecoder('utf-8').decode(all) };
}

function isJsonContentType(value) {
  return /^application\/json\s*(;|$)/i.test((value || '').trim());
}

/* ---------------- wspólne ---------------- */

/** Dostawca kalendarza – tylko przy publicznych dokumentach prawnych (klauzula przy formularzu). */
export function defaultProvider(env = process.env, { legalPublic = LEGAL_PUBLIC } = {}) {
  return legalPublic ? getBookingProvider(env) : null;
}

function resolveProvider(getProvider) {
  try {
    return { provider: getProvider() };
  } catch (err) {
    logError('provider configuration error', err);
    return { response: json({ error: 'calendar' }, 502) };
  }
}

function errorResponse(err, context) {
  if (err instanceof SlotTakenError) return json({ error: 'taken' }, 409);
  if (err instanceof BookingLimitError) return json({ error: 'limit' }, 409);
  if (err instanceof BookingPausedError) return json({ error: 'paused' }, 503);
  if (err instanceof CalendarError) {
    logError(`${context}: calendar error`, err);
    return json({ error: 'calendar' }, 502);
  }
  logError(`${context}: unexpected error`, err instanceof BookingError ? err : { name: err && err.name });
  return json({ error: 'server' }, 500);
}

function rateLimited(limiter, request, now, env) {
  const result = limiter.check(clientKey(request.headers, env), now);
  if (result.ok) return null;
  return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(result.retryAfterSec) });
}

/* ---------------- GET /api/booking/slots ---------------- */

/**
 * ?date=YYYY-MM-DD&treatment=<id>  → 200 { date, treatment, timeZone, slots: ['10:00', …] }
 * ?month=YYYY-MM&treatment=<id>    → 200 { month, treatment, timeZone, days: { 'YYYY-MM-DD': n } }
 */
export async function handleSlotsGet(request, deps = {}) {
  const {
    env = process.env,
    config = BOOKING_CONFIG,
    now = () => new Date(),
    getProvider = () => defaultProvider(env),
    limiter = sharedLimiter('get', config.rateLimit.get),
  } = deps;

  if (!isAllowedOrigin(request, { required: false, env })) return json({ error: 'forbidden' }, 403);

  const resolved = resolveProvider(getProvider);
  if (resolved.response) return resolved.response;
  const { provider } = resolved;
  if (!provider) return json({ error: 'disabled' }, 503);

  const nowDate = now();
  const limited = rateLimited(limiter, request, nowDate.getTime(), env);
  if (limited) return limited;

  const parsed = parseSlotsQuery(new URL(request.url).searchParams);
  if (!parsed.success) return json({ error: 'invalid', fields: issueFields(parsed.error) }, 400);
  const { treatment, date, month } = parsed.data;

  const signal = AbortSignal.timeout(config.timeouts.slotsMs);
  try {
    if (date) {
      const slots = await getDaySlots({ provider, date, treatmentId: treatment, now: nowDate, config, signal });
      return json({ date, treatment, timeZone: config.timeZone, slots });
    }
    const days = await getMonthAvailability({ provider, month, treatmentId: treatment, now: nowDate, config, signal });
    return json({ month, treatment, timeZone: config.timeZone, days });
  } catch (err) {
    return errorResponse(err, 'slots');
  }
}

/* ---------------- POST /api/booking ---------------- */

/**
 * Body JSON: { treatment, date, time, name, phone, email, note?, website? (honeypot),
 *              formToken (podpisany znacznik z renderu strony), requestId? (UUID próby),
 *              turnstileToken? (gdy Turnstile skonfigurowany) }
 * → 201 { bookingId, treatment, start, end, timeZone }
 */
export async function handleBookingPost(request, deps = {}) {
  const {
    env = process.env,
    config = BOOKING_CONFIG,
    now = () => new Date(),
    getProvider = () => defaultProvider(env),
    limiter = sharedLimiter('post', config.rateLimit.post),
    secret = bookingSecret(env),
    turnstile = turnstileKeys(env),
    verifyCaptcha = verifyTurnstile,
    newId,
    log,
  } = deps;

  if (!isAllowedOrigin(request, { required: true, env })) return json({ error: 'forbidden' }, 403);

  const resolved = resolveProvider(getProvider);
  if (resolved.response) return resolved.response;
  const { provider } = resolved;
  if (!provider) return json({ error: 'disabled' }, 503);

  const nowDate = now();
  const limited = rateLimited(limiter, request, nowDate.getTime(), env);
  if (limited) return limited;

  if (!isJsonContentType(request.headers.get('content-type'))) {
    return json({ error: 'unsupported_media_type' }, 415);
  }

  let body;
  try {
    const read = await readBodyLimited(request, config.maxBodyBytes);
    if (!read.ok) return json({ error: 'too_large' }, 413);
    body = JSON.parse(read.text);
  } catch {
    return json({ error: 'invalid' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'invalid' }, 400);

  // Honeypot: pole „website” jest niewidoczne dla ludzi – wypełnione = bot.
  if (body.website !== undefined && body.website !== null && (typeof body.website !== 'string' || body.website.trim() !== '')) {
    return json({ error: 'invalid' }, 400);
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'invalid', fields: issueFields(parsed.error) }, 400);
  const input = parsed.data;

  // Znacznik formularza podpisany przez serwer przy renderze strony: wysłanie szybciej niż
  // minFormFillMs = bot; bez ważnego znacznika (skrypt, który nie otworzył strony) – odmowa.
  // Liczymy wyłącznie zegarem serwera – zły zegar przeglądarki nie ma znaczenia.
  const form = checkFormToken(input.formToken, {
    now: nowDate.getTime(),
    secret,
    minAgeMs: config.minFormFillMs,
    maxAgeMs: config.formTokenMaxAgeMs,
  });
  if (form === 'too_fast') return json({ error: 'too_fast' }, 400);
  if (form !== 'ok') return json({ error: 'form_expired' }, 400);

  // Cloudflare Turnstile (gdy skonfigurowany) – jedyna bariera dla skryptu z losowymi danymi.
  if (turnstile) {
    const verdict = await verifyCaptcha(input.turnstileToken, { secretKey: turnstile.secretKey });
    if (!verdict.ok) {
      if (verdict.unavailable) logError('captcha verification unavailable', { name: 'TurnstileUnavailable' });
      return json({ error: 'captcha' }, verdict.unavailable ? 502 : 400);
    }
  }

  try {
    const result = await createBooking({
      provider,
      input,
      now: nowDate,
      config,
      secret,
      ...(newId ? { newId } : {}),
      ...(log ? { log } : {}),
    });
    return json(result, 201);
  } catch (err) {
    return errorResponse(err, 'booking');
  }
}
