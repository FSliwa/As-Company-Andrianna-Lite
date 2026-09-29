/**
 * Ochrona przed nadużyciami rezerwacji online (tylko serwer – node:crypto).
 *
 *  - sekret rezerwacji (HMAC): BOOKING_SECRET albo – gdy go brak – pochodna
 *    klucza konta usługi (ten sam na każdej instancji serverless),
 *  - skróty kontaktu (telefon / e-mail) do limitu wizyt na osobę – w kalendarzu
 *    zapisujemy tylko HMAC, nie da się z niego odczytać numeru ani adresu,
 *  - identyfikator wydarzenia wyprowadzony z identyfikatora żądania (idempotentny zapis),
 *  - podpisany znacznik czasu formularza (zamiast zegara przeglądarki),
 *  - opcjonalna weryfikacja Cloudflare Turnstile (TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY).
 *
 * Importy wyłącznie względne – testy `node --test` bez bundlera.
 */

import crypto from 'node:crypto';
import { normalizePrivateKey } from './google.js';

const SECRET_STORE = Symbol.for('as-company.booking.secret');
const MIN_SECRET_LENGTH = 16;

/* ---------------- sekret ---------------- */

/**
 * Sekret do HMAC. Kolejność: BOOKING_SECRET (≥ 16 znaków) → pochodna GOOGLE_PRIVATE_KEY
 * → losowy sekret procesu (tylko dev/test z kalendarzem w pamięci).
 */
export function bookingSecret(env = process.env) {
  const explicit = String(env.BOOKING_SECRET || '').trim();
  if (explicit.length >= MIN_SECRET_LENGTH) return explicit;
  const key = normalizePrivateKey(env.GOOGLE_PRIVATE_KEY || '');
  if (key) return crypto.createHash('sha256').update('as-company/booking/v1\u0000').update(key).digest('hex');
  if (!globalThis[SECRET_STORE]) globalThis[SECRET_STORE] = crypto.randomBytes(32).toString('hex');
  return globalThis[SECRET_STORE];
}

function hmacHex(secret, label, value) {
  return crypto.createHmac('sha256', secret).update(`${label}\u0000${value}`).digest('hex');
}

/* ---------------- kontakt ---------------- */

/** Telefon → same cyfry, bez prefiksu kraju 48 / 0048 (600 700 800 = +48 600 700 800). */
export function normalizePhoneForHash(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0048')) digits = digits.slice(4);
  else if (digits.length === 11 && digits.startsWith('48')) digits = digits.slice(2);
  return digits;
}

/** E-mail → małe litery, bez „+dopisku” w części lokalnej. */
export function normalizeEmailForHash(email) {
  const value = String(email || '').trim().toLowerCase();
  const at = value.lastIndexOf('@');
  if (at < 1) return value;
  return `${value.slice(0, at).split('+')[0]}@${value.slice(at + 1)}`;
}

/** Skróty kontaktu zapisywane w extendedProperties.private (32 znaki hex). */
export function contactHashes({ phone, email }, secret) {
  return {
    phoneHash: hmacHex(secret, 'phone', normalizePhoneForHash(phone)).slice(0, 32),
    emailHash: hmacHex(secret, 'email', normalizeEmailForHash(email)).slice(0, 32),
  };
}

/** Skrót całej treści zgłoszenia – czy powtórzone żądanie niesie te same dane. */
export function payloadHash(input, secret) {
  const parts = [input.treatment, input.date, input.time, input.name, input.phone, input.email, input.note || ''];
  return hmacHex(secret, 'payload', JSON.stringify(parts)).slice(0, 32);
}

/**
 * Identyfikator wydarzenia w Kalendarzu Google z identyfikatora rezerwacji.
 * 32 znaki hex ⊂ base32hex (a–v, 0–9), 5–1024 znaków – wymagania Google Events.id.
 * HMAC zamiast samego UUID klienta: nikt z zewnątrz nie wskaże id cudzego wydarzenia.
 */
export function eventIdFor(bookingId, secret) {
  return hmacHex(secret, 'event', String(bookingId)).slice(0, 32);
}

/* ---------------- znacznik formularza ---------------- */

/** Podpisany czas wydania formularza: '<ms base36>.<hmac>' – wydawany przy renderze /umow-wizyte. */
export function issueFormToken({ now = Date.now(), secret }) {
  const ts = Math.floor(now).toString(36);
  return `${ts}.${hmacHex(secret, 'form', ts).slice(0, 32)}`;
}

/**
 * @returns {'ok' | 'invalid' | 'too_fast' | 'expired'}
 */
export function checkFormToken(token, { now = Date.now(), secret, minAgeMs, maxAgeMs }) {
  if (typeof token !== 'string') return 'invalid';
  const match = /^([0-9a-z]{1,12})\.([0-9a-f]{32})$/.exec(token);
  if (!match) return 'invalid';
  const expected = Buffer.from(hmacHex(secret, 'form', match[1]).slice(0, 32));
  const given = Buffer.from(match[2]);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return 'invalid';
  const issued = parseInt(match[1], 36);
  if (!Number.isFinite(issued)) return 'invalid';
  const age = now - issued;
  if (age < minAgeMs) return age < -5 * 60 * 1000 ? 'invalid' : 'too_fast';
  if (age > maxAgeMs) return 'expired';
  return 'ok';
}

/* ---------------- Cloudflare Turnstile ---------------- */

export const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const TURNSTILE_ACTION = 'booking';

/** Klucze Turnstile z env albo null (oba muszą być ustawione – inaczej weryfikacja wyłączona). */
export function turnstileKeys(env = process.env) {
  const siteKey = String(env.TURNSTILE_SITE_KEY || '').trim();
  const secretKey = String(env.TURNSTILE_SECRET_KEY || '').trim();
  return siteKey && secretKey ? { siteKey, secretKey } : null;
}

/**
 * Weryfikacja tokenu Turnstile po stronie serwera.
 * @returns {Promise<{ ok: boolean, unavailable?: boolean }>}
 */
export async function verifyTurnstile(token, { secretKey, fetchImpl = globalThis.fetch, timeoutMs = 5000 }) {
  if (typeof token !== 'string' || !token || token.length > 2048) return { ok: false };
  let res;
  try {
    res = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, unavailable: true };
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok || !data) return { ok: false, unavailable: true };
  if (data.success !== true) return { ok: false };
  if (data.action && data.action !== TURNSTILE_ACTION) return { ok: false };
  return { ok: true };
}
