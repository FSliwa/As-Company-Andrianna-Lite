import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { issueFormToken } from './abuse.js';
import { CalendarApiError, CalendarConfigError } from './errors.js';
import { handleBookingPost, handleSlotsGet, isAllowedOrigin } from './handlers.js';
import { createMemoryCalendar } from './memory.js';
import { createRateLimiter } from './ratelimit.js';

const NOW = new Date('2026-10-19T08:00:00Z');
const ORIGIN = 'http://localhost:3000';
const ENV = { NODE_ENV: 'test' };
const SECRET = 'test-secret-handlers-0123456789';
const formToken = (msBefore) => issueFormToken({ now: NOW.getTime() - msBefore, secret: SECRET });

let provider;
let deps;
let errors;
const originalError = console.error;

beforeEach(() => {
  provider = createMemoryCalendar({ env: { NODE_ENV: 'development' }, seed: false, now: () => NOW.getTime() });
  deps = {
    env: ENV,
    now: () => NOW,
    getProvider: () => provider,
    limiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
    secret: SECRET,
    turnstile: null,
  };
  errors = [];
  console.error = (...args) => errors.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
});
afterEach(() => {
  console.error = originalError;
});

const get = (qs, headers = {}) => new Request(`${ORIGIN}/api/booking/slots?${qs}`, { headers: { host: 'localhost:3000', ...headers } });

const body = {
  treatment: 'perfect-lips',
  date: '2026-10-26',
  time: '10:00',
  name: 'Anna Kowalska',
  phone: '+48 600 700 800',
  email: 'anna@example.com',
  note: '',
  website: '',
  formToken: formToken(30_000),
};

function post(data = body, headers = {}) {
  return new Request(`${ORIGIN}/api/booking`, {
    method: 'POST',
    headers: { host: 'localhost:3000', origin: ORIGIN, 'content-type': 'application/json', ...headers },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  });
}

async function read(res) {
  return { status: res.status, json: await res.json(), headers: res.headers };
}

describe('GET /api/booking/slots', () => {
  test('503 disabled, gdy brak dostawcy; no-store', async () => {
    const r = await read(await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), { ...deps, getProvider: () => null }));
    assert.equal(r.status, 503);
    assert.deepEqual(r.json, { error: 'disabled' });
    assert.match(r.headers.get('cache-control'), /no-store/);
  });
  test('200 — sloty dnia', async () => {
    const r = await read(await handleSlotsGet(get('date=2026-10-26&treatment=perfect-lips'), deps));
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.json), ['date', 'treatment', 'timeZone', 'slots']);
    assert.equal(r.json.slots[0], '10:00');
    assert.equal(r.json.slots.at(-1), '15:30');
    assert.equal(r.json.timeZone, 'Europe/Warsaw');
    assert.match(r.headers.get('cache-control'), /no-store/);
  });
  test('200 — miesiąc', async () => {
    const r = await read(await handleSlotsGet(get('month=2026-11&treatment=korekta'), deps));
    assert.equal(r.status, 200);
    assert.equal(r.json.month, '2026-11');
    assert.equal(Object.keys(r.json.days).length, 30);
    assert.equal(r.json.days['2026-11-02'], 14);
    assert.equal(r.json.days['2026-11-01'], 0);
  });
  test('400 przy złej dacie / zabiegu / braku parametrów', async () => {
    for (const qs of ['date=2026-02-30&treatment=korekta', 'date=2026-10-26&treatment=x', 'treatment=korekta', 'date=jutro']) {
      const r = await read(await handleSlotsGet(get(qs), deps));
      assert.equal(r.status, 400, qs);
      assert.equal(r.json.error, 'invalid');
      assert.ok(Array.isArray(r.json.fields));
    }
  });
  test('403 przy obcym Origin lub Sec-Fetch-Site: cross-site; brak Origin dozwolony', async () => {
    assert.equal((await handleSlotsGet(get('date=2026-10-26&treatment=korekta', { origin: 'https://evil.example' }), deps)).status, 403);
    assert.equal((await handleSlotsGet(get('date=2026-10-26&treatment=korekta', { 'sec-fetch-site': 'cross-site' }), deps)).status, 403);
    assert.equal((await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), deps)).status, 200);
  });
  test('429 po przekroczeniu limitu, z Retry-After', async () => {
    const limited = { ...deps, limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }) };
    await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), limited);
    await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), limited);
    const r = await read(await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), limited));
    assert.equal(r.status, 429);
    assert.deepEqual(r.json, { error: 'rate_limited' });
    assert.equal(r.headers.get('retry-after'), '60');
  });
  test('502 calendar przy błędzie Google, log bez szczegółów', async () => {
    const broken = { ...provider, freeBusy: async () => { throw new CalendarApiError('x', { status: 403, reason: 'forbidden' }); } };
    const r = await read(await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), { ...deps, getProvider: () => broken }));
    assert.equal(r.status, 502);
    assert.deepEqual(r.json, { error: 'calendar' });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /CalendarApiError/);
  });
  test('502 calendar przy błędnej konfiguracji dostawcy', async () => {
    const r = await read(
      await handleSlotsGet(get('date=2026-10-26&treatment=korekta'), {
        ...deps,
        getProvider: () => {
          throw new CalendarConfigError('bad key');
        },
      })
    );
    assert.equal(r.status, 502);
  });
});

describe('POST /api/booking', () => {
  test('201 — zapis i odpowiedź', async () => {
    const r = await read(await handleBookingPost(post(), deps));
    assert.equal(r.status, 201);
    assert.deepEqual(Object.keys(r.json).sort(), ['bookingId', 'end', 'start', 'timeZone', 'treatment']);
    assert.equal(r.json.start, '2026-10-26T10:00:00+01:00');
    assert.equal(r.json.end, '2026-10-26T12:00:00+01:00');
    assert.match(r.json.bookingId, /^[0-9a-f-]{36}$/);
    assert.match(r.headers.get('cache-control'), /no-store/);
    const events = provider.snapshot();
    assert.equal(events.length, 1);
    assert.equal(events[0].summary, 'Wizyta: Perfect Lips — Anna Kowalska');
    assert.equal(events[0].attendees, undefined);
  });
  test('409 taken — drugi raz ten sam termin; sloty GET już go nie pokazują', async () => {
    assert.equal((await handleBookingPost(post(), deps)).status, 201);
    const r = await read(await handleBookingPost(post({ ...body, name: 'Beata Nowak' }), deps));
    assert.equal(r.status, 409);
    assert.deepEqual(r.json, { error: 'taken' });
    const slots = await read(await handleSlotsGet(get('date=2026-10-26&treatment=perfect-lips'), deps));
    assert.ok(!slots.json.slots.includes('10:00'));
    assert.equal(slots.json.slots[0], '12:30', '10:00 + 2 h + 15 min bufora → 12:15 → pierwszy na siatce 12:30');
  });
  test('409 taken — termin poza oknem (za wcześnie)', async () => {
    const r = await read(await handleBookingPost(post({ ...body, date: '2026-10-19' }), deps));
    assert.equal(r.status, 409);
  });
  test('503 disabled', async () => {
    const r = await read(await handleBookingPost(post(), { ...deps, getProvider: () => null }));
    assert.equal(r.status, 503);
    assert.deepEqual(r.json, { error: 'disabled' });
  });
  test('403 — brak Origin/Referer, obcy Origin, Origin "null"; Referer z tego hosta przechodzi', async () => {
    const noOrigin = new Request(`${ORIGIN}/api/booking`, {
      method: 'POST',
      headers: { host: 'localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    assert.equal((await handleBookingPost(noOrigin, deps)).status, 403);
    assert.equal((await handleBookingPost(post(body, { origin: 'https://evil.example' }), deps)).status, 403);
    assert.equal((await handleBookingPost(post(body, { origin: 'null' }), deps)).status, 403);
    const withReferer = new Request(`${ORIGIN}/api/booking`, {
      method: 'POST',
      headers: { host: 'localhost:3000', referer: `${ORIGIN}/umow-wizyte`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    assert.equal((await handleBookingPost(withReferer, deps)).status, 201);
  });
  test('Origin zgodny z X-Forwarded-Host (proxy) lub NEXT_PUBLIC_SITE_URL', () => {
    const behindProxy = new Request('http://10.0.0.5:3000/api/booking', {
      method: 'POST',
      headers: { host: '10.0.0.5:3000', 'x-forwarded-host': 'as-loveliness.eu', origin: 'https://as-loveliness.eu' },
    });
    assert.equal(isAllowedOrigin(behindProxy, { required: true, env: {} }), true);
    const viaSiteUrl = new Request('http://internal/api/booking', { method: 'POST', headers: { origin: 'https://www.example.pl' } });
    assert.equal(isAllowedOrigin(viaSiteUrl, { required: true, env: { NEXT_PUBLIC_SITE_URL: 'https://www.example.pl' } }), true);
    assert.equal(isAllowedOrigin(viaSiteUrl, { required: true, env: {} }), false);
  });
  test('415 — zły Content-Type', async () => {
    const r = await read(await handleBookingPost(post(body, { 'content-type': 'text/plain' }), deps));
    assert.equal(r.status, 415);
  });
  test('413 — body > 8 KB (Content-Length i strumień bez nagłówka)', async () => {
    const big = { ...body, note: 'x'.repeat(9000) };
    assert.equal((await handleBookingPost(post(big), deps)).status, 413);
    const stream = new ReadableStream({
      start(controller) {
        for (let i = 0; i < 10; i += 1) controller.enqueue(new TextEncoder().encode('x'.repeat(1024)));
        controller.close();
      },
    });
    const chunked = new Request(`${ORIGIN}/api/booking`, {
      method: 'POST',
      headers: { host: 'localhost:3000', origin: ORIGIN, 'content-type': 'application/json' },
      body: stream,
      duplex: 'half',
    });
    assert.equal((await handleBookingPost(chunked, deps)).status, 413);
  });
  test('400 — niepoprawny JSON / nie-obiekt', async () => {
    assert.equal((await handleBookingPost(post('{nope'), deps)).status, 400);
    assert.equal((await handleBookingPost(post('[1,2]'), deps)).status, 400);
  });
  test('400 — honeypot wypełniony, bez zapisu', async () => {
    const r = await read(await handleBookingPost(post({ ...body, website: 'http://spam' }), deps));
    assert.equal(r.status, 400);
    assert.deepEqual(r.json, { error: 'invalid' });
    assert.equal(provider.snapshot().length, 0);
  });
  test('400 too_fast — znacznik formularza młodszy niż 3 s (zegar serwera, nie przeglądarki)', async () => {
    const r = await read(await handleBookingPost(post({ ...body, formToken: formToken(1000) }), deps));
    assert.equal(r.status, 400);
    assert.deepEqual(r.json, { error: 'too_fast' });
    assert.equal(provider.snapshot().length, 0);
  });
  test('400 form_expired — brak, podrobiony, obcy lub przeterminowany znacznik (dawny startedAt=1 nie działa)', async () => {
    const forged = `${Math.floor(NOW.getTime() - 60_000).toString(36)}.${'0'.repeat(32)}`;
    const foreign = issueFormToken({ now: NOW.getTime() - 60_000, secret: 'inny-sekret-0123456789' });
    const old = formToken(25 * 60 * 60 * 1000);
    for (const [label, data] of [
      ['brak', { ...body, formToken: undefined }],
      ['podrobiony', { ...body, formToken: forged }],
      ['inny sekret', { ...body, formToken: foreign }],
      ['> 24 h', { ...body, formToken: old }],
      ['startedAt', { ...body, formToken: undefined, startedAt: 1 }],
    ]) {
      const r = await read(await handleBookingPost(post(data), deps));
      assert.equal(r.status, 400, label);
      assert.ok(['form_expired', 'invalid'].includes(r.json.error), label);
    }
    assert.equal(provider.snapshot().length, 0);
  });
  test('400 invalid — lista pól bez wartości', async () => {
    const r = await read(await handleBookingPost(post({ ...body, phone: '123', email: 'x', time: '10:15' }), deps));
    assert.equal(r.status, 400);
    assert.equal(r.json.error, 'invalid');
    assert.deepEqual(r.json.fields.sort(), ['email', 'phone', 'time']);
    assert.ok(!JSON.stringify(r.json).includes('123'));
  });
  test('429 — limit POST', async () => {
    const limited = { ...deps, limiter: createRateLimiter({ limit: 1, windowMs: 600_000 }) };
    await handleBookingPost(post({ ...body, name: '' }), limited);
    const r = await handleBookingPost(post(), limited);
    assert.equal(r.status, 429);
    assert.ok(Number(r.headers.get('retry-after')) > 0);
  });
  test('502 calendar — błąd zapisu w Google; logi bez danych osobowych', async () => {
    const broken = {
      ...provider,
      insertEvent: async () => {
        throw new CalendarApiError('Google Calendar API error', { status: 500, reason: 'backendError' });
      },
    };
    const r = await read(await handleBookingPost(post(), { ...deps, getProvider: () => broken }));
    assert.equal(r.status, 502);
    assert.deepEqual(r.json, { error: 'calendar' });
    assert.equal(errors.length, 1);
    for (const secret of ['Anna', 'Kowalska', '600 700 800', 'anna@example.com', '127.0.0.1']) {
      assert.ok(!errors[0].includes(secret), `log zawiera ${secret}`);
    }
  });
  test('500 server — nieoczekiwany wyjątek, bez szczegółów w odpowiedzi', async () => {
    const broken = {
      ...provider,
      freeBusy: async () => {
        throw new Error('anna@example.com boom');
      },
    };
    const r = await read(await handleBookingPost(post(), { ...deps, getProvider: () => broken }));
    assert.equal(r.status, 500);
    assert.deepEqual(r.json, { error: 'server' });
    assert.ok(!errors.join(' ').includes('anna@example.com'));
  });
});
