/**
 * Klient Kalendarza Google bez `googleapis` – tylko serwer (node:crypto + fetch).
 *
 * Uwierzytelnienie: konto usługi → JWT RS256 podpisany `crypto.createSign('RSA-SHA256')`
 * → wymiana na token (grant jwt-bearer) → cache w pamięci do `exp − 60 s`.
 * Każde wywołanie ma timeout (AbortSignal.timeout, domyślnie 10 s), a błędy są
 * mapowane na własne klasy z errors.js – bez treści odpowiedzi i danych osobowych.
 *
 * Interfejs (wspólny z memory.js); każda metoda przyjmuje opcjonalny `signal`
 * (łączny budżet czasu żądania – łączony z timeoutem pojedynczego wywołania):
 *   freeBusy({ timeMin, timeMax, signal })          → [{ start, end }] (ISO)
 *   listEvents({ timeMin, timeMax?, privateProperty?, signal })
 *                                                   → [{ id, status, start, end, transparency, created,
 *                                                        extendedProperties, eventType, attendees }]
 *   getEvent(eventId, { signal })                   → wydarzenie (te same pola) albo null (404/410)
 *   insertEvent(event, { signal })                  → { id, created, start, end, status }
 *                                                     (event.id zajęte → CalendarApiError 409)
 *   patchEvent(eventId, patch, { signal })          → { id, created, start, end, status }
 *   deleteEvent(eventId, { signal })                → void (404/410 = już usunięte)
 */

import crypto from 'node:crypto';
import {
  CalendarApiError,
  CalendarAuthError,
  CalendarConfigError,
  CalendarNetworkError,
  CalendarTimeoutError,
} from './errors.js';
import { toMs } from './time.js';

export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
export const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
export const JWT_BEARER_GRANT = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
export const DEFAULT_TIMEOUT_MS = 10_000;
const TOKEN_SAFETY_MS = 60_000;
const MAX_EVENT_PAGES = 10;

// eventType – urodziny i miejsce pracy nie blokują terminów (slots.js › blocksTime);
// attendees(self,responseStatus) – odrzucone zaproszenia też nie.
const EVENT_FIELDS = 'id,status,start,end,transparency,created,extendedProperties,eventType,attendees(self,responseStatus)';

/**
 * Klucz z env → PEM. Hostingi często przechowują go w jednej linii z literalnymi
 * `\n` (tak jest w pliku JSON konta usługi) i czasem w cudzysłowach.
 */
export function normalizePrivateKey(raw) {
  if (typeof raw !== 'string') return '';
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
  return key ? `${key}\n` : '';
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

/**
 * Podpisany JWT (RS256) dla wymiany na token dostępu.
 * @param {{ clientEmail: string, privateKey: string | crypto.KeyObject, scope?: string,
 *           audience?: string, nowSec?: number, lifetimeSec?: number }} args
 */
export function createJwt({
  clientEmail,
  privateKey,
  scope = GOOGLE_CALENDAR_SCOPE,
  audience = GOOGLE_TOKEN_URL,
  nowSec = Math.floor(Date.now() / 1000),
  lifetimeSec = 3600,
}) {
  let key = privateKey;
  if (!(key instanceof crypto.KeyObject)) {
    try {
      key = crypto.createPrivateKey(normalizePrivateKey(privateKey));
    } catch {
      throw new CalendarConfigError('GOOGLE_PRIVATE_KEY is not a valid PEM private key');
    }
  }
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = { iss: clientEmail, scope, aud: audience, iat: nowSec, exp: nowSec + lifetimeSec };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).end().sign(key);
  return `${signingInput}.${signature.toString('base64url')}`;
}

async function fetchWithTimeout(fetchImpl, url, init, timeoutMs, budget) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = budget ? AbortSignal.any([timeout, budget]) : timeout;
  try {
    return await fetchImpl(url, { ...init, cache: 'no-store', signal });
  } catch (err) {
    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new CalendarTimeoutError('Google request timed out');
    }
    throw new CalendarNetworkError('Google request failed', { cause: err });
  }
}

async function readJson(res) {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new CalendarTimeoutError('Google response timed out');
    }
    return null;
  }
}

function apiReason(data) {
  const e = data && data.error;
  if (!e || typeof e !== 'object') return null;
  const reason = (Array.isArray(e.errors) && e.errors[0] && e.errors[0].reason) || e.status || null;
  return typeof reason === 'string' ? reason.slice(0, 64) : null;
}

function iso(value) {
  const ms = toMs(value);
  if (!Number.isFinite(ms)) throw new TypeError('Invalid time value');
  return new Date(ms).toISOString();
}

/**
 * @param {{ clientEmail: string, privateKey: string, calendarId: string,
 *           fetchImpl?: typeof fetch, timeoutMs?: number, now?: () => number }} options
 */
export function createGoogleCalendar({
  clientEmail,
  privateKey,
  calendarId,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = () => Date.now(),
}) {
  if (!clientEmail || !String(clientEmail).includes('@')) {
    throw new CalendarConfigError('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing or invalid');
  }
  if (!calendarId) throw new CalendarConfigError('GOOGLE_CALENDAR_ID is missing');
  const pem = normalizePrivateKey(privateKey);
  if (!pem.includes('PRIVATE KEY')) throw new CalendarConfigError('GOOGLE_PRIVATE_KEY is missing or invalid');

  let keyObject = null;
  let token = null; // { value, expiresAt }
  let inflight = null;

  function signingKey() {
    if (!keyObject) {
      try {
        keyObject = crypto.createPrivateKey(pem);
      } catch {
        throw new CalendarConfigError('GOOGLE_PRIVATE_KEY is not a valid PEM private key');
      }
    }
    return keyObject;
  }

  async function fetchToken() {
    const assertion = createJwt({
      clientEmail,
      privateKey: signingKey(),
      nowSec: Math.floor(now() / 1000),
    });
    const res = await fetchWithTimeout(
      fetchImpl,
      GOOGLE_TOKEN_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({ grant_type: JWT_BEARER_GRANT, assertion }).toString(),
      },
      timeoutMs
    );
    const data = await readJson(res);
    if (!res.ok || !data || typeof data.access_token !== 'string') {
      const reason = data && typeof data.error === 'string' ? data.error.slice(0, 64) : null;
      throw new CalendarAuthError('Google token exchange failed', { status: res.status, reason });
    }
    const expiresIn = Number(data.expires_in) > 0 ? Number(data.expires_in) : 3600;
    token = { value: data.access_token, expiresAt: now() + expiresIn * 1000 - TOKEN_SAFETY_MS };
    return token.value;
  }

  async function getAccessToken() {
    if (token && now() < token.expiresAt) return token.value;
    if (!inflight) {
      inflight = fetchToken().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  async function api(method, path, { query, body, okStatuses = [], signal } = {}, retried = false) {
    if (signal && signal.aborted) throw new CalendarTimeoutError('Google request budget exceeded');
    const accessToken = await getAccessToken();
    const url = new URL(GOOGLE_CALENDAR_API + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        // Parametry powtarzalne (np. privateExtendedProperty) – tablica = kilka wpisów.
        if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, String(item)));
        else url.searchParams.set(k, String(v));
      }
    }
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetchWithTimeout(
      fetchImpl,
      url.toString(),
      { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined },
      timeoutMs,
      signal
    );

    if (res.status === 401 && !retried) {
      // Token unieważniony wcześniej niż wynikało z exp – jedna ponowna próba z nowym.
      token = null;
      return api(method, path, { query, body, okStatuses, signal }, true);
    }
    if (okStatuses.includes(res.status)) return null;
    if (!res.ok) {
      const data = await readJson(res);
      const reason = apiReason(data);
      if (res.status === 401) throw new CalendarAuthError('Google Calendar rejected the token', { status: 401, reason });
      throw new CalendarApiError('Google Calendar API error', { status: res.status, reason });
    }
    if (res.status === 204) return null;
    return readJson(res);
  }

  const calendarPath = `/calendars/${encodeURIComponent(calendarId)}`;

  return {
    kind: 'google',

    async freeBusy({ timeMin, timeMax, signal }) {
      const data = await api('POST', '/freeBusy', {
        body: { timeMin: iso(timeMin), timeMax: iso(timeMax), timeZone: 'UTC', items: [{ id: calendarId }] },
        signal,
      });
      const calendars = (data && data.calendars) || {};
      const entry = calendars[calendarId] || Object.values(calendars)[0];
      if (!entry) throw new CalendarApiError('freeBusy returned no calendar', { status: 200, reason: 'noCalendar' });
      if (Array.isArray(entry.errors) && entry.errors.length) {
        // Najczęściej 'notFound' – kalendarz nie jest udostępniony kontu usługi.
        const reason = entry.errors[0] && typeof entry.errors[0].reason === 'string' ? entry.errors[0].reason : 'unknown';
        throw new CalendarApiError('freeBusy calendar error', { status: 200, reason });
      }
      return (entry.busy || []).map((b) => ({ start: b.start, end: b.end }));
    },

    /**
     * `privateProperty` ({ source: 'www' }) → privateExtendedProperty=source=www
     * (kilka par = wszystkie muszą pasować). Bez `timeMax` – wszystkie od `timeMin`.
     */
    async listEvents({ timeMin, timeMax, privateProperty, signal }) {
      const items = [];
      let pageToken;
      const privateExtendedProperty = privateProperty
        ? Object.entries(privateProperty).map(([k, v]) => `${k}=${v}`)
        : undefined;
      for (let page = 0; page < MAX_EVENT_PAGES; page += 1) {
        const data = await api('GET', `${calendarPath}/events`, {
          signal,
          query: {
            timeMin: iso(timeMin),
            timeMax: timeMax === undefined || timeMax === null ? undefined : iso(timeMax),
            privateExtendedProperty,
            singleEvents: 'true',
            showDeleted: 'false',
            orderBy: 'startTime',
            maxResults: 250,
            // Tylko pola potrzebne do liczenia zajętości – bez tytułów i opisów (RODO).
            fields: `items(${EVENT_FIELDS}),nextPageToken`,
            pageToken,
          },
        });
        if (data && Array.isArray(data.items)) items.push(...data.items);
        pageToken = data && data.nextPageToken;
        if (!pageToken) break;
      }
      return items;
    },

    async getEvent(eventId, { signal } = {}) {
      return api('GET', `${calendarPath}/events/${encodeURIComponent(eventId)}`, {
        query: { fields: EVENT_FIELDS },
        okStatuses: [404, 410],
        signal,
      });
    },

    async insertEvent(event, { signal } = {}) {
      return api('POST', `${calendarPath}/events`, {
        query: { sendUpdates: 'none', fields: 'id,status,start,end,created' },
        body: event,
        signal,
      });
    },

    async patchEvent(eventId, patch, { signal } = {}) {
      return api('PATCH', `${calendarPath}/events/${encodeURIComponent(eventId)}`, {
        query: { sendUpdates: 'none', fields: 'id,status,start,end,created' },
        body: patch,
        signal,
      });
    },

    async deleteEvent(eventId, { signal } = {}) {
      await api('DELETE', `${calendarPath}/events/${encodeURIComponent(eventId)}`, {
        query: { sendUpdates: 'none' },
        okStatuses: [404, 410],
        signal,
      });
    },
  };
}
