import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TURNSTILE_VERIFY_URL,
  bookingSecret,
  checkFormToken,
  contactHashes,
  eventIdFor,
  issueFormToken,
  normalizeEmailForHash,
  normalizePhoneForHash,
  turnstileKeys,
  verifyTurnstile,
} from './abuse.js';
import { BOOKING_CONFIG } from './config.js';
import {
  BookingLimitError,
  BookingPausedError,
  CalendarApiError,
  CalendarTimeoutError,
  SlotTakenError,
} from './errors.js';
import { handleBookingPost } from './handlers.js';
import { createMemoryCalendar } from './memory.js';
import { createRateLimiter } from './ratelimit.js';
import { createBooking, getDaySlots, invalidateBusyCache } from './service.js';
import { zonedToUtc } from './time.js';

const TZ = 'Europe/Warsaw';
const NOW = new Date('2026-10-19T08:00:00Z'); // pon 10:00 CEST
const DEV = { NODE_ENV: 'development' };
const SECRET = 'test-secret-abuse-0123456789abcdef';
const at = (date, time) => zonedToUtc(date, time, TZ).toISOString();
const quiet = () => {};

const input = {
  treatment: 'korekta',
  date: '2026-10-26',
  time: '12:00',
  name: 'Anna Kowalska',
  phone: '+48 600 700 800',
  email: 'anna@example.com',
  note: '',
};

function memory(opts = {}) {
  return createMemoryCalendar({ env: DEV, seed: false, now: () => NOW.getTime(), ...opts });
}

function book(provider, data = {}, opts = {}) {
  return createBooking({ provider, input: { ...input, ...data }, now: NOW, secret: SECRET, log: quiet, ...opts });
}

describe('abuse.js – skróty kontaktu, id wydarzenia, sekret', () => {
  test('telefon: same cyfry, bez 48 / 0048; e-mail: małe litery, bez +dopisku', () => {
    for (const p of ['+48 600 700 800', '600-700-800', '0048600700800', '48600700800', '600 700 800']) {
      assert.equal(normalizePhoneForHash(p), '600700800', p);
    }
    assert.equal(normalizePhoneForHash('+44 20 7946 0958'), '442079460958');
    assert.equal(normalizeEmailForHash(' Anna+rezerwacja@Example.COM '), 'anna@example.com');
  });
  test('contactHashes: ten sam kontakt w różnym zapisie → ten sam skrót; inny sekret → inny; brak danych jawnych', () => {
    const a = contactHashes({ phone: '+48 600 700 800', email: 'Anna@example.com' }, SECRET);
    const b = contactHashes({ phone: '600700800', email: 'anna+x@example.com' }, SECRET);
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, contactHashes({ phone: '600700800', email: 'anna@example.com' }, 'inny-sekret-0123456789'));
    assert.match(a.phoneHash, /^[0-9a-f]{32}$/);
    assert.ok(!JSON.stringify(a).includes('600'));
  });
  test('eventIdFor: base32hex, 32 znaki, deterministyczny', () => {
    const id = eventIdFor('0b8f5a52-5d2c-4c1e-9d59-3b0a3f5c1e2a', SECRET);
    assert.match(id, /^[0-9a-v]{32}$/);
    assert.equal(id, eventIdFor('0b8f5a52-5d2c-4c1e-9d59-3b0a3f5c1e2a', SECRET));
    assert.notEqual(id, eventIdFor('0b8f5a52-5d2c-4c1e-9d59-3b0a3f5c1e2b', SECRET));
  });
  test('bookingSecret: BOOKING_SECRET → pochodna klucza Google → sekret procesu', () => {
    assert.equal(bookingSecret({ BOOKING_SECRET: 'x'.repeat(40) }), 'x'.repeat(40));
    const fromKey = bookingSecret({ GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n' });
    assert.match(fromKey, /^[0-9a-f]{64}$/);
    assert.equal(fromKey, bookingSecret({ GOOGLE_PRIVATE_KEY: '"-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n"' }));
    assert.equal(bookingSecret({}), bookingSecret({ BOOKING_SECRET: 'za-krotki' }), 'krótki sekret ignorowany');
  });
});

describe('abuse.js – znacznik formularza', () => {
  const opts = { secret: SECRET, minAgeMs: 3000, maxAgeMs: 24 * 3600 * 1000 };
  const t0 = 1_790_000_000_000;
  const token = issueFormToken({ now: t0, secret: SECRET });
  test('wiek 3 s – 24 h → ok; młodszy → too_fast; starszy → expired', () => {
    assert.equal(checkFormToken(token, { ...opts, now: t0 + 3000 }), 'ok');
    assert.equal(checkFormToken(token, { ...opts, now: t0 + 2999 }), 'too_fast');
    assert.equal(checkFormToken(token, { ...opts, now: t0 + 24 * 3600 * 1000 + 1 }), 'expired');
  });
  test('podpis: zmieniony czas, inny sekret, śmieci → invalid', () => {
    const [, sig] = token.split('.');
    assert.equal(checkFormToken(`${(t0 - 60_000).toString(36)}.${sig}`, { ...opts, now: t0 + 10_000 }), 'invalid');
    assert.equal(checkFormToken(token, { ...opts, secret: 'inny-sekret-0123456789', now: t0 + 10_000 }), 'invalid');
    for (const bad of [undefined, '', 'x', 1, `${token}x`]) assert.equal(checkFormToken(bad, { ...opts, now: t0 + 10_000 }), 'invalid');
  });
  test('znacznik z przyszłości (> 5 min) → invalid', () => {
    const future = issueFormToken({ now: t0 + 3600_000, secret: SECRET });
    assert.equal(checkFormToken(future, { ...opts, now: t0 }), 'invalid');
  });
});

describe('abuse.js – Cloudflare Turnstile', () => {
  const fake = (res) => {
    const calls = [];
    const fn = async (url, init) => {
      calls.push({ url, init });
      if (res instanceof Error) throw res;
      return res;
    };
    fn.calls = calls;
    return fn;
  };
  const ok = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  test('klucze: oba wymagane', () => {
    assert.equal(turnstileKeys({ TURNSTILE_SITE_KEY: 'a' }), null);
    assert.deepEqual(turnstileKeys({ TURNSTILE_SITE_KEY: 'a', TURNSTILE_SECRET_KEY: 'b' }), { siteKey: 'a', secretKey: 'b' });
  });
  test('siteverify: POST form-urlencoded z sekretem i tokenem; success → ok', async () => {
    const fetchImpl = fake(ok({ success: true, action: 'booking' }));
    assert.deepEqual(await verifyTurnstile('tok', { secretKey: 'sec', fetchImpl }), { ok: true });
    assert.equal(fetchImpl.calls[0].url, TURNSTILE_VERIFY_URL);
    const params = new URLSearchParams(fetchImpl.calls[0].init.body);
    assert.equal(params.get('secret'), 'sec');
    assert.equal(params.get('response'), 'tok');
  });
  test('odmowa, zła akcja, brak tokenu → ok: false; sieć / 5xx → unavailable', async () => {
    assert.deepEqual(await verifyTurnstile('tok', { secretKey: 's', fetchImpl: fake(ok({ success: false })) }), { ok: false });
    assert.deepEqual(await verifyTurnstile('tok', { secretKey: 's', fetchImpl: fake(ok({ success: true, action: 'login' })) }), { ok: false });
    assert.deepEqual(await verifyTurnstile('', { secretKey: 's', fetchImpl: fake(ok({ success: true })) }), { ok: false });
    assert.deepEqual(await verifyTurnstile('tok', { secretKey: 's', fetchImpl: fake(new TypeError('fetch failed')) }), { ok: false, unavailable: true });
    assert.deepEqual(await verifyTurnstile('tok', { secretKey: 's', fetchImpl: fake(ok({}, 500)) }), { ok: false, unavailable: true });
  });
});

describe('S1 – limit na kontakt i bezpiecznik', () => {
  test('ten sam telefon ALBO e-mail: 2 przyszłe wizyty przechodzą, trzecia → BookingLimitError', async () => {
    const cal = memory();
    await book(cal, { time: '10:00' });
    await book(cal, { time: '14:00', email: 'inny@example.com' }); // ten sam telefon, inny e-mail
    await assert.rejects(book(cal, { date: '2026-10-27', time: '10:00', phone: '600-700-800', email: 'trzeci@example.com' }), BookingLimitError);
    // Inna osoba – bez limitu.
    await book(cal, { date: '2026-10-27', time: '10:00', phone: '511 222 333', email: 'beata@example.com', name: 'Beata Nowak' });
    assert.equal(cal.snapshot().length, 3);

    const byEmail = memory();
    await book(byEmail, { time: '10:00' });
    await book(byEmail, { time: '14:00', phone: '511 222 333', email: 'anna+druga@example.com' }); // ten sam e-mail
    await assert.rejects(book(byEmail, { date: '2026-10-27', time: '10:00', phone: '722 333 444', email: 'ANNA@example.com' }), BookingLimitError);
    assert.equal(byEmail.snapshot().length, 2);
  });

  test('bezpiecznik: maxPerHour wpisów z www w ostatniej godzinie → BookingPausedError; po godzinie znowu działa', async () => {
    let clock = NOW.getTime();
    const cal = createMemoryCalendar({ env: DEV, seed: false, now: () => clock });
    const config = { ...BOOKING_CONFIG, abuse: { maxActivePerContact: 2, maxPerHour: 3, maxPerDay: 10 } };
    const logs = [];
    const run = (i, now) =>
      createBooking({
        provider: cal,
        input: { ...input, date: '2026-10-28', time: ['10:00', '11:30', '13:00', '14:30', '16:00'][i], phone: `60070080${i}`, email: `k${i}@example.com` },
        now,
        config,
        secret: SECRET,
        log: (m) => logs.push(m),
      });
    for (let i = 0; i < 3; i += 1) await run(i, NOW);
    await assert.rejects(run(3, NOW), (e) => e instanceof BookingPausedError && e.window === 'hour');
    assert.equal(cal.snapshot().length, 3, 'szkoda ograniczona do progu');
    const later = new Date(NOW.getTime() + 61 * 60 * 1000);
    clock = later.getTime();
    await run(3, later);
    assert.equal(cal.snapshot().length, 4);
    assert.ok(logs.some((m) => /fuse/.test(m)), 'ostrzeżenie w logu');
  });

  test('bezpiecznik dobowy (maxPerDay)', async () => {
    let clock = NOW.getTime() - 20 * 3600 * 1000;
    const cal = createMemoryCalendar({ env: DEV, seed: false, now: () => clock });
    const config = { ...BOOKING_CONFIG, abuse: { maxActivePerContact: 5, maxPerHour: 100, maxPerDay: 2 } };
    const mk = (time, i) =>
      createBooking({ provider: cal, input: { ...input, date: '2026-10-29', time, phone: `51122233${i}`, email: `d${i}@example.com` }, now: new Date(clock), config, secret: SECRET, log: quiet });
    await mk('10:00', 1);
    clock = NOW.getTime();
    await mk('12:00', 2);
    await assert.rejects(mk('14:00', 3), (e) => e instanceof BookingPausedError && e.window === 'day');
  });

  test('handler: 409 { error: "limit" } i 503 { error: "paused" }', async () => {
    const { issueFormToken: issue } = await import('./abuse.js');
    const cal = memory();
    const deps = {
      env: { NODE_ENV: 'test' },
      now: () => NOW,
      getProvider: () => cal,
      limiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
      secret: SECRET,
      turnstile: null,
      log: quiet,
    };
    const post = (data) =>
      new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/json' },
        body: JSON.stringify({ ...input, website: '', formToken: issue({ now: NOW.getTime() - 10_000, secret: SECRET }), ...data }),
      });
    assert.equal((await handleBookingPost(post({ time: '10:00' }), deps)).status, 201);
    assert.equal((await handleBookingPost(post({ time: '14:00' }), deps)).status, 201);
    const limited = await handleBookingPost(post({ date: '2026-10-27', time: '10:00' }), deps);
    assert.equal(limited.status, 409);
    assert.deepEqual(await limited.json(), { error: 'limit' });
    const paused = await handleBookingPost(post({ date: '2026-10-27', time: '10:00', phone: '511222333', email: 'x@example.com' }), {
      ...deps,
      config: { ...BOOKING_CONFIG, abuse: { maxActivePerContact: 2, maxPerHour: 2, maxPerDay: 10 } },
    });
    assert.equal(paused.status, 503);
    assert.deepEqual(await paused.json(), { error: 'paused' });
  });

  test('handler: Turnstile – brak/zły token 400 captcha, niedostępny 502, poprawny 201', async () => {
    const { issueFormToken: issue } = await import('./abuse.js');
    const cal = memory();
    const seen = [];
    const verdicts = { good: { ok: true }, bad: { ok: false }, down: { ok: false, unavailable: true } };
    const deps = {
      env: { NODE_ENV: 'test' },
      now: () => NOW,
      getProvider: () => cal,
      limiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
      secret: SECRET,
      turnstile: { siteKey: 'site', secretKey: 'secret' },
      verifyCaptcha: async (token, { secretKey }) => {
        seen.push([token, secretKey]);
        return verdicts[token] || { ok: false };
      },
      log: quiet,
    };
    const post = (turnstileToken) =>
      new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/json' },
        body: JSON.stringify({ ...input, formToken: issue({ now: NOW.getTime() - 10_000, secret: SECRET }), turnstileToken }),
      });
    const r1 = await handleBookingPost(post(undefined), deps);
    assert.equal(r1.status, 400);
    assert.deepEqual(await r1.json(), { error: 'captcha' });
    assert.equal((await handleBookingPost(post('bad'), deps)).status, 400);
    const origError = console.error;
    console.error = quiet;
    try {
      assert.equal((await handleBookingPost(post('down'), deps)).status, 502);
    } finally {
      console.error = origError;
    }
    assert.equal(cal.snapshot().length, 0, 'bez zapisu przed weryfikacją');
    assert.equal((await handleBookingPost(post('good'), deps)).status, 201);
    assert.deepEqual(seen.at(-1), ['good', 'secret']);
  });
});

describe('S4 – zapis idempotentny', () => {
  const REQ = '0b8f5a52-5d2c-4c1e-9d59-3b0a3f5c1e2a';

  test('id wydarzenia = HMAC(requestId); bookingId = requestId', async () => {
    const cal = memory();
    const result = await book(cal, { requestId: REQ });
    assert.equal(result.bookingId, REQ);
    const [event] = cal.snapshot();
    assert.equal(event.id, eventIdFor(REQ, SECRET));
    assert.equal(event.extendedProperties.private.bookingId, REQ);
  });

  test('Google zapisał, ale odpowiedź nie dotarła (timeout) → ponowienie z tym samym id → sukces, jeden wpis', async () => {
    const base = memory();
    let inserts = 0;
    const cal = {
      ...base,
      async insertEvent(event, opts) {
        inserts += 1;
        const out = await base.insertEvent(event, opts);
        if (inserts === 1) throw new CalendarTimeoutError('late');
        return out;
      },
    };
    const result = await book(cal, { requestId: REQ });
    assert.equal(result.bookingId, REQ);
    assert.equal(inserts, 2, 'jedna ponowna próba (409 duplicate → nasze wydarzenie)');
    assert.equal(base.snapshot().length, 1);
  });

  test('błąd 5xx po zapisie → przed 502 sprawdzamy getEvent → sukces', async () => {
    const base = memory();
    const logs = [];
    const cal = {
      ...base,
      async insertEvent(event) {
        if (!base.snapshot().length) await base.insertEvent(event);
        throw new CalendarApiError('x', { status: 503, reason: 'backendError' });
      },
    };
    const result = await book(cal, { requestId: REQ }, { log: (m) => logs.push(m) });
    assert.equal(result.bookingId, REQ);
    assert.equal(base.snapshot().length, 1);
    assert.ok(logs.includes('insert recovered after error'));
  });

  test('„sierota” po 502 (Google niedostępny) → ponowienie z tym samym requestId → 201, bez drugiego wpisu i bez 409', async () => {
    const base = memory();
    const broken = {
      ...base,
      async insertEvent(event) {
        await base.insertEvent(event).catch(() => {});
        throw new CalendarApiError('x', { status: 500 });
      },
      async getEvent() {
        throw new CalendarTimeoutError('down');
      },
    };
    await assert.rejects(book(broken, { requestId: REQ }), CalendarApiError);
    assert.equal(base.snapshot().length, 1, 'wpis zapisał się mimo błędu');
    const retry = await book(base, { requestId: REQ });
    assert.equal(retry.bookingId, REQ);
    assert.equal(retry.start, '2026-10-26T12:00:00+01:00');
    assert.equal(base.snapshot().length, 1);
  });

  test('ponowienie z poprawionym telefonem → opis wpisu zaktualizowany, nadal jeden wpis', async () => {
    const base = memory();
    await book(base, { requestId: REQ });
    await book(base, { requestId: REQ, phone: '511 222 333' });
    const events = base.snapshot();
    assert.equal(events.length, 1);
    assert.ok(events[0].description.includes('Telefon: 511 222 333'));
    assert.ok(!events[0].description.includes('600 700 800'));
  });

  test('ten sam requestId z inną godziną → 409 (nie nadpisujemy innej wizyty)', async () => {
    const base = memory();
    await book(base, { requestId: REQ });
    await assert.rejects(book(base, { requestId: REQ, time: '15:00' }), SlotTakenError);
    assert.equal(base.snapshot().length, 1);
  });

  test('łączny budżet czasu: zawieszone Google → błąd po budżecie, nie po 4 × timeout', async () => {
    const base = memory();
    const hang = ({ signal }) =>
      new Promise((_, reject) => signal.addEventListener('abort', () => reject(new CalendarTimeoutError('budget')), { once: true }));
    const cal = { ...base, freeBusy: hang };
    const config = { ...BOOKING_CONFIG, timeouts: { ...BOOKING_CONFIG.timeouts, bookingMs: 60 } };
    const keepAlive = setInterval(() => {}, 1000);
    const t = Date.now();
    try {
      await assert.rejects(book(cal, {}, { config }), CalendarTimeoutError);
    } finally {
      clearInterval(keepAlive);
    }
    assert.ok(Date.now() - t < 1000);
  });
});

describe('S6 – mikro-cache zajętości dla GET', () => {
  function counting(provider) {
    const calls = { freeBusy: 0, listEvents: 0 };
    return {
      ...provider,
      calls,
      async freeBusy(r) {
        calls.freeBusy += 1;
        return provider.freeBusy(r);
      },
      async listEvents(r) {
        calls.listEvents += 1;
        return provider.listEvents(r);
      },
    };
  }
  test('identyczne i równoległe zapytania → jedno wywołanie; po invalidate – świeże', async () => {
    const cal = counting(memory());
    const args = { provider: cal, date: '2026-10-26', treatmentId: 'korekta', now: NOW };
    await Promise.all([getDaySlots(args), getDaySlots(args), getDaySlots(args)]);
    await getDaySlots(args);
    assert.equal(cal.calls.freeBusy, 1);
    assert.equal(cal.calls.listEvents, 1);
    invalidateBusyCache(cal);
    await getDaySlots(args);
    assert.equal(cal.calls.freeBusy, 2);
  });
  test('busyCacheMs: 0 → bez cache; błąd nie jest zapamiętywany', async () => {
    const cal = counting(memory());
    const config = { ...BOOKING_CONFIG, busyCacheMs: 0 };
    const args = { provider: cal, date: '2026-10-26', treatmentId: 'korekta', now: NOW, config };
    await getDaySlots(args);
    await getDaySlots(args);
    assert.equal(cal.calls.freeBusy, 2);
    let fail = true;
    const flaky = {
      ...memory(),
      async freeBusy() {
        if (fail) throw new CalendarApiError('x', { status: 503 });
        return [];
      },
    };
    await assert.rejects(getDaySlots({ provider: flaky, date: '2026-10-26', treatmentId: 'korekta', now: NOW }), CalendarApiError);
    fail = false;
    assert.ok((await getDaySlots({ provider: flaky, date: '2026-10-26', treatmentId: 'korekta', now: NOW })).length > 0);
  });
  test('POST pyta na świeżo (cache GET nie ukrywa świeżej wizyty)', async () => {
    const cal = memory();
    const args = { provider: cal, date: '2026-10-26', treatmentId: 'korekta', now: NOW };
    assert.ok((await getDaySlots(args)).includes('12:00'));
    await book(cal);
    await assert.rejects(book(cal, { phone: '511222333', email: 'b@example.com', name: 'Beata Nowak' }), SlotTakenError);
    assert.ok(!(await getDaySlots(args)).includes('12:00'), 'cache unieważniony po zapisie');
  });
});

describe('T1 – urodziny, miejsce pracy i odrzucone zaproszenia nie blokują', () => {
  let cal;
  beforeEach(() => {
    cal = memory();
  });
  afterEach(() => invalidateBusyCache(cal));
  const day = { start: { date: '2026-10-27' }, end: { date: '2026-10-28' }, transparency: 'transparent' };

  test('urodziny (eventType birthday, całodniowe, „Dostępny”) → dzień ma sloty', async () => {
    await cal.insertEvent({ ...day, eventType: 'birthday' });
    assert.equal((await getDaySlots({ provider: cal, date: '2026-10-27', treatmentId: 'korekta', now: NOW })).length, 14);
  });
  test('workingLocation → dzień ma sloty', async () => {
    await cal.insertEvent({ ...day, eventType: 'workingLocation', transparency: 'transparent' });
    assert.equal((await getDaySlots({ provider: cal, date: '2026-10-27', treatmentId: 'korekta', now: NOW })).length, 14);
  });
  test('ręczny „Urlop” (default, „Dostępny”) dalej blokuje cały dzień', async () => {
    await cal.insertEvent({ ...day, eventType: 'default' });
    assert.deepEqual(await getDaySlots({ provider: cal, date: '2026-10-27', treatmentId: 'korekta', now: NOW }), []);
  });
  test('zaproszenie odrzucone przez właścicielkę nie blokuje; zaakceptowane blokuje', async () => {
    const slot = { start: { dateTime: at('2026-10-27', '12:00') }, end: { dateTime: at('2026-10-27', '13:00') } };
    await cal.insertEvent({ ...slot, attendees: [{ self: true, responseStatus: 'declined' }] });
    assert.ok((await getDaySlots({ provider: cal, date: '2026-10-27', treatmentId: 'korekta', now: NOW })).includes('12:00'));
    await cal.insertEvent({ ...slot, attendees: [{ self: true, responseStatus: 'accepted' }] });
    invalidateBusyCache(cal);
    assert.ok(!(await getDaySlots({ provider: cal, date: '2026-10-27', treatmentId: 'korekta', now: NOW })).includes('12:00'));
  });
  test('rezerwacja w dzień urodzin przechodzi (także kontrola wyścigu)', async () => {
    await cal.insertEvent({ ...day, start: { date: '2026-10-26' }, end: { date: '2026-10-27' }, eventType: 'birthday' });
    const result = await book(cal);
    assert.equal(result.start, '2026-10-26T12:00:00+01:00');
  });
});
