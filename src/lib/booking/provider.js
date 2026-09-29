/**
 * Wybór dostawcy kalendarza wg zmiennych środowiskowych.
 *
 *   BOOKING_PROVIDER=google  + GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID
 *   BOOKING_PROVIDER=memory  – tylko dev/test; w production ignorowany (rezerwacja wyłączona)
 *   brak BOOKING_PROVIDER    – google, jeśli są wszystkie trzy zmienne GOOGLE_*; inaczej wyłączone
 *   BOOKING_PROVIDER=off     – wyłączone
 *
 * `null` = rezerwacja online wyłączona (API → 503 { error: 'disabled' }).
 * Instancje trzymamy w globalThis, bo Next.js w dev pakuje każdą trasę osobno –
 * inaczej GET i POST widziałyby dwa różne kalendarze w pamięci.
 */

import crypto from 'node:crypto';
import { BOOKING_CONFIG } from './config.js';
import { createGoogleCalendar } from './google.js';
import { createMemoryCalendar } from './memory.js';

const STORE_KEY = Symbol.for('as-company.booking.provider');

function store() {
  if (!globalThis[STORE_KEY]) globalThis[STORE_KEY] = { google: null, googleKey: null, memory: null, warned: false };
  return globalThis[STORE_KEY];
}

function googleVars(env) {
  return {
    clientEmail: (env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim(),
    privateKey: env.GOOGLE_PRIVATE_KEY || '',
    calendarId: (env.GOOGLE_CALENDAR_ID || '').trim(),
  };
}

function hasGoogleVars(env) {
  const v = googleVars(env);
  return Boolean(v.clientEmail && v.privateKey.trim() && v.calendarId);
}

/** 'google' | 'memory' | null – bez tworzenia klienta. */
export function resolveProviderName(env = process.env) {
  const explicit = (env.BOOKING_PROVIDER || '').trim().toLowerCase();
  if (explicit === 'google') return hasGoogleVars(env) ? 'google' : null;
  if (explicit === 'memory') return env.NODE_ENV === 'production' ? null : 'memory';
  if (explicit) return null;
  return hasGoogleVars(env) ? 'google' : null;
}

/** Czy rezerwacja online jest włączona (do serwerowego wrappera strony). */
export function isBookingEnabled(env = process.env) {
  return resolveProviderName(env) !== null;
}

/**
 * Dostawca albo null. Może rzucić CalendarConfigError, gdy zmienne Google są
 * obecne, ale nieprawidłowe (np. uszkodzony klucz) – handler zwraca wtedy 502.
 */
export function getBookingProvider(env = process.env) {
  const s = store();
  const explicit = (env.BOOKING_PROVIDER || '').trim().toLowerCase();

  if (explicit === 'memory' && env.NODE_ENV === 'production' && !s.warned) {
    s.warned = true;
    console.warn('[booking] BOOKING_PROVIDER=memory is ignored in production – online booking disabled');
  }

  const name = resolveProviderName(env);
  if (name === 'memory') {
    if (!s.memory) s.memory = createMemoryCalendar({ timeZone: BOOKING_CONFIG.timeZone, env });
    return s.memory;
  }
  if (name === 'google') {
    const vars = googleVars(env);
    const key = crypto
      .createHash('sha256')
      .update(`${vars.clientEmail}\u0000${vars.calendarId}\u0000${vars.privateKey}`)
      .digest('hex');
    if (!s.google || s.googleKey !== key) {
      s.google = createGoogleCalendar(vars);
      s.googleKey = key;
    }
    return s.google;
  }
  return null;
}

/** Tylko testy: czyści zapamiętane instancje. */
export function resetBookingProviderForTests() {
  globalThis[STORE_KEY] = undefined;
}
