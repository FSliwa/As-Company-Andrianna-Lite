import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  CalendarApiError,
  CalendarAuthError,
  CalendarConfigError,
  CalendarError,
  CalendarNetworkError,
  CalendarTimeoutError,
} from './errors.js';
import {
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_TOKEN_URL,
  JWT_BEARER_GRANT,
  createGoogleCalendar,
  createJwt,
  normalizePrivateKey,
} from './google.js';

// Klucz generowany w teście — żadnych prawdziwych sekretów w repozytorium.
const { privateKey: PRIVATE_PEM, publicKey: PUBLIC_KEY } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const EMAIL = 'rezerwacje@test-project.iam.gserviceaccount.com';
const CALENDAR = 'salon@example.com';
/** Tak klucz wygląda w zmiennej środowiskowej: jedna linia, literalne \n, w cudzysłowach. */
const ENV_STYLE_KEY = `"${PRIVATE_PEM.trim().replace(/\n/g, '\\n')}\\n"`;

function decodeJwt(jwt) {
  const [h, p, s] = jwt.split('.');
  return {
    header: JSON.parse(Buffer.from(h, 'base64url').toString()),
    payload: JSON.parse(Buffer.from(p, 'base64url').toString()),
    signingInput: `${h}.${p}`,
    signature: Buffer.from(s, 'base64url'),
  };
}

const jsonResponse = (status, body) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Atrapa fetch: zapisuje wywołania, odpowiada wg funkcji `route`. */
function fakeFetch(route) {
  const calls = [];
  const fn = async (url, init = {}) => {
    const call = { url: String(url), init };
    calls.push(call);
    return route(call, calls);
  };
  fn.calls = calls;
  return fn;
}

function tokenOk(expiresIn = 3600, n = 1) {
  return jsonResponse(200, { access_token: `token-${n}`, expires_in: expiresIn, token_type: 'Bearer' });
}

function isToken(call) {
  return call.url === GOOGLE_TOKEN_URL;
}

describe('normalizePrivateKey', () => {
  test('literalne \\n i cudzysłowy → poprawny PEM akceptowany przez node:crypto', () => {
    const pem = normalizePrivateKey(ENV_STYLE_KEY);
    assert.ok(pem.startsWith('-----BEGIN PRIVATE KEY-----\n'));
    assert.ok(pem.endsWith('-----END PRIVATE KEY-----\n'));
    assert.ok(!pem.includes('\\n'));
    assert.doesNotThrow(() => crypto.createPrivateKey(pem));
  });
  test('klucz z prawdziwymi nowymi liniami zostaje bez zmian (poza końcowym \\n)', () => {
    assert.equal(normalizePrivateKey(PRIVATE_PEM), `${PRIVATE_PEM.trim()}\n`);
  });
  test('CRLF i \\r\\n literalne', () => {
    const crlf = PRIVATE_PEM.replace(/\n/g, '\r\n');
    assert.doesNotThrow(() => crypto.createPrivateKey(normalizePrivateKey(crlf)));
    const literalCrlf = PRIVATE_PEM.trim().replace(/\n/g, '\\r\\n');
    assert.doesNotThrow(() => crypto.createPrivateKey(normalizePrivateKey(literalCrlf)));
  });
  test('puste / nie-string → ""', () => {
    assert.equal(normalizePrivateKey(undefined), '');
    assert.equal(normalizePrivateKey('   '), '');
  });
});

describe('createJwt — RS256', () => {
  const nowSec = 1_790_000_000;
  const jwt = createJwt({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, nowSec });
  const { header, payload, signingInput, signature } = decodeJwt(jwt);

  test('podpis weryfikuje się kluczem publicznym', () => {
    assert.equal(crypto.verify('RSA-SHA256', Buffer.from(signingInput), PUBLIC_KEY, signature), true);
  });
  test('zmodyfikowany payload nie przechodzi weryfikacji', () => {
    const forged = Buffer.from(JSON.stringify({ ...payload, iss: 'evil@example.com' })).toString('base64url');
    const input = `${signingInput.split('.')[0]}.${forged}`;
    assert.equal(crypto.verify('RSA-SHA256', Buffer.from(input), PUBLIC_KEY, signature), false);
  });
  test('nagłówek i pola: iss, scope, aud, iat, exp', () => {
    assert.deepEqual(header, { alg: 'RS256', typ: 'JWT' });
    assert.equal(payload.iss, EMAIL);
    assert.equal(payload.scope, GOOGLE_CALENDAR_SCOPE);
    assert.equal(payload.scope, 'https://www.googleapis.com/auth/calendar');
    assert.equal(payload.aud, 'https://oauth2.googleapis.com/token');
    assert.equal(payload.iat, nowSec);
    assert.equal(payload.exp, nowSec + 3600);
    assert.equal(Object.keys(payload).length, 5);
  });
  test('base64url bez paddingu i znaków +/', () => {
    assert.match(jwt, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });
  test('uszkodzony klucz → CalendarConfigError', () => {
    assert.throws(
      () => createJwt({ clientEmail: EMAIL, privateKey: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----' }),
      CalendarConfigError
    );
  });
});

describe('createGoogleCalendar — konfiguracja', () => {
  test('brak e-maila / kalendarza / klucza → CalendarConfigError', () => {
    assert.throws(() => createGoogleCalendar({ clientEmail: '', privateKey: ENV_STYLE_KEY, calendarId: CALENDAR }), CalendarConfigError);
    assert.throws(() => createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: '' }), CalendarConfigError);
    assert.throws(() => createGoogleCalendar({ clientEmail: EMAIL, privateKey: 'nope', calendarId: CALENDAR }), CalendarConfigError);
  });
  test('klucz z nagłówkiem PEM, ale uszkodzony → CalendarConfigError przy pierwszym wywołaniu', async () => {
    const fetchImpl = fakeFetch(() => tokenOk());
    const cal = createGoogleCalendar({
      clientEmail: EMAIL,
      privateKey: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n',
      calendarId: CALENDAR,
      fetchImpl,
    });
    await assert.rejects(cal.freeBusy({ timeMin: 0, timeMax: 1 }), CalendarConfigError);
    assert.equal(fetchImpl.calls.length, 0);
  });
});

describe('createGoogleCalendar — token', () => {
  test('wymiana JWT na token: POST form-urlencoded, grant jwt-bearer, ważny podpis', async () => {
    const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : jsonResponse(200, { calendars: { [CALENDAR]: { busy: [] } } })));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await cal.freeBusy({ timeMin: '2026-10-26T00:00:00Z', timeMax: '2026-10-27T00:00:00Z' });

    const tokenCall = fetchImpl.calls[0];
    assert.equal(tokenCall.url, GOOGLE_TOKEN_URL);
    assert.equal(tokenCall.init.method, 'POST');
    assert.equal(tokenCall.init.headers['Content-Type'], 'application/x-www-form-urlencoded');
    const form = new URLSearchParams(tokenCall.init.body);
    assert.equal(form.get('grant_type'), JWT_BEARER_GRANT);
    const { payload, signingInput, signature } = decodeJwt(form.get('assertion'));
    assert.equal(crypto.verify('RSA-SHA256', Buffer.from(signingInput), PUBLIC_KEY, signature), true);
    assert.equal(payload.iss, EMAIL);

    const apiCall = fetchImpl.calls[1];
    assert.equal(apiCall.init.headers.Authorization, 'Bearer token-1');
  });

  test('cache tokenu do exp − 60 s, potem odświeżenie', async () => {
    let now = 1_790_000_000_000;
    let issued = 0;
    const fetchImpl = fakeFetch((call) => {
      if (isToken(call)) return tokenOk(3600, ++issued);
      return jsonResponse(200, { calendars: { [CALENDAR]: { busy: [] } } });
    });
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl, now: () => now });
    const range = { timeMin: 0, timeMax: 1000 };
    await cal.freeBusy(range);
    await cal.freeBusy(range);
    assert.equal(issued, 1);

    now += (3600 - 61) * 1000; // jeszcze przed exp − 60 s
    await cal.freeBusy(range);
    assert.equal(issued, 1);

    now += 2000; // po exp − 60 s
    await cal.freeBusy(range);
    assert.equal(issued, 2);
    assert.equal(fetchImpl.calls.at(-1).init.headers.Authorization, 'Bearer token-2');
  });

  test('równoległe wywołania pobierają token raz', async () => {
    let issued = 0;
    const fetchImpl = fakeFetch(async (call) => {
      if (isToken(call)) {
        await new Promise((r) => setTimeout(r, 10));
        return tokenOk(3600, ++issued);
      }
      return jsonResponse(200, { items: [] });
    });
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await Promise.all([cal.listEvents({ timeMin: 0, timeMax: 1 }), cal.listEvents({ timeMin: 0, timeMax: 1 }), cal.listEvents({ timeMin: 0, timeMax: 1 })]);
    assert.equal(issued, 1);
  });

  test('401 z API → nowy token i jedna ponowna próba', async () => {
    let issued = 0;
    let apiCalls = 0;
    const fetchImpl = fakeFetch((call) => {
      if (isToken(call)) return tokenOk(3600, ++issued);
      apiCalls += 1;
      if (apiCalls === 1) return jsonResponse(401, { error: { code: 401 } });
      return jsonResponse(200, { items: [{ id: 'e1' }] });
    });
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    const items = await cal.listEvents({ timeMin: 0, timeMax: 1 });
    assert.deepEqual(items, [{ id: 'e1' }]);
    assert.equal(issued, 2);
  });

  test('401 dwa razy → CalendarAuthError', async () => {
    const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : jsonResponse(401, { error: { code: 401 } })));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await assert.rejects(cal.listEvents({ timeMin: 0, timeMax: 1 }), CalendarAuthError);
  });

  test('odrzucony JWT (400 invalid_grant) → CalendarAuthError z reason, bez treści odpowiedzi', async () => {
    const fetchImpl = fakeFetch(() => jsonResponse(400, { error: 'invalid_grant', error_description: 'Invalid JWT Signature for salon@example.com' }));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await assert.rejects(cal.freeBusy({ timeMin: 0, timeMax: 1 }), (err) => {
      assert.ok(err instanceof CalendarAuthError);
      assert.ok(err instanceof CalendarError);
      assert.equal(err.code, 'calendar');
      assert.equal(err.kind, 'auth');
      assert.equal(err.status, 400);
      assert.equal(err.reason, 'invalid_grant');
      assert.ok(!err.message.includes('salon@example.com'));
      return true;
    });
  });
});

describe('createGoogleCalendar — timeouty i błędy', () => {
  test('każde żądanie ma AbortSignal i cache: no-store', async () => {
    const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : jsonResponse(200, { items: [] })));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await cal.listEvents({ timeMin: 0, timeMax: 1 });
    for (const call of fetchImpl.calls) {
      assert.ok(call.init.signal instanceof AbortSignal);
      assert.equal(call.init.cache, 'no-store');
    }
  });

  test('brak odpowiedzi w czasie → CalendarTimeoutError (AbortSignal.timeout)', async () => {
    const fetchImpl = fakeFetch(
      (call) =>
        new Promise((resolve, reject) => {
          if (isToken(call)) return resolve(tokenOk());
          call.init.signal.addEventListener('abort', () => reject(call.init.signal.reason));
        })
    );
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl, timeoutMs: 30 });
    // Timer AbortSignal.timeout jest „unref” — w serwerze pętlę trzyma przy życiu nasłuchujący
    // socket, w teście trzeba ją podtrzymać ręcznie.
    const keepAlive = setInterval(() => {}, 1000);
    try {
      await assert.rejects(cal.freeBusy({ timeMin: 0, timeMax: 1 }), CalendarTimeoutError);
    } finally {
      clearInterval(keepAlive);
    }
  });

  test('domyślny timeout to 10 s', async () => {
    const { DEFAULT_TIMEOUT_MS } = await import('./google.js');
    assert.equal(DEFAULT_TIMEOUT_MS, 10_000);
  });

  test('błąd sieci → CalendarNetworkError', async () => {
    const fetchImpl = fakeFetch(() => {
      throw new TypeError('fetch failed');
    });
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await assert.rejects(cal.freeBusy({ timeMin: 0, timeMax: 1 }), CalendarNetworkError);
  });

  test('403 → CalendarApiError ze statusem i reason', async () => {
    const fetchImpl = fakeFetch((call) =>
      isToken(call) ? tokenOk() : jsonResponse(403, { error: { code: 403, message: 'x', errors: [{ reason: 'requiredAccessLevel' }] } })
    );
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await assert.rejects(cal.insertEvent({ summary: 'x' }), (err) => {
      assert.ok(err instanceof CalendarApiError);
      assert.equal(err.status, 403);
      assert.equal(err.reason, 'requiredAccessLevel');
      return true;
    });
  });

  test('freeBusy: kalendarz nieudostępniony (errors: notFound) → CalendarApiError', async () => {
    const fetchImpl = fakeFetch((call) =>
      isToken(call) ? tokenOk() : jsonResponse(200, { calendars: { [CALENDAR]: { errors: [{ domain: 'global', reason: 'notFound' }], busy: [] } } })
    );
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await assert.rejects(cal.freeBusy({ timeMin: 0, timeMax: 1 }), (err) => err instanceof CalendarApiError && err.reason === 'notFound');
  });
});

describe('createGoogleCalendar — wywołania REST', () => {
  test('freeBusy: treść żądania i wynik', async () => {
    const busy = [{ start: '2026-10-26T09:00:00Z', end: '2026-10-26T10:00:00Z' }];
    const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : jsonResponse(200, { calendars: { [CALENDAR]: { busy } } })));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    const out = await cal.freeBusy({ timeMin: new Date('2026-10-26T00:00:00Z'), timeMax: '2026-10-27T00:00:00Z' });
    assert.deepEqual(out, busy);
    const call = fetchImpl.calls[1];
    assert.equal(call.url, 'https://www.googleapis.com/calendar/v3/freeBusy');
    assert.equal(call.init.method, 'POST');
    assert.deepEqual(JSON.parse(call.init.body), {
      timeMin: '2026-10-26T00:00:00.000Z',
      timeMax: '2026-10-27T00:00:00.000Z',
      timeZone: 'UTC',
      items: [{ id: CALENDAR }],
    });
  });

  test('listEvents: singleEvents, ograniczone pola (bez tytułów/opisów), stronicowanie', async () => {
    let page = 0;
    const fetchImpl = fakeFetch((call) => {
      if (isToken(call)) return tokenOk();
      page += 1;
      return page === 1 ? jsonResponse(200, { items: [{ id: 'a' }], nextPageToken: 'p2' }) : jsonResponse(200, { items: [{ id: 'b' }] });
    });
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    const items = await cal.listEvents({ timeMin: '2026-10-26T00:00:00Z', timeMax: '2026-10-27T00:00:00Z' });
    assert.deepEqual(items.map((i) => i.id), ['a', 'b']);
    const first = new URL(fetchImpl.calls[1].url);
    assert.equal(first.pathname, `/calendar/v3/calendars/${encodeURIComponent(CALENDAR)}/events`);
    assert.equal(first.searchParams.get('singleEvents'), 'true');
    assert.equal(first.searchParams.get('timeMin'), '2026-10-26T00:00:00.000Z');
    assert.ok(!first.searchParams.get('fields').includes('summary'));
    assert.ok(!first.searchParams.get('fields').includes('description'));
    assert.equal(new URL(fetchImpl.calls[2].url).searchParams.get('pageToken'), 'p2');
  });

  test('insertEvent: POST z JSON i sendUpdates=none', async () => {
    const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : jsonResponse(200, { id: 'new1', created: '2026-10-19T08:00:00.000Z' })));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    const event = { summary: 'Wizyta', start: { dateTime: '2026-10-26T10:00:00+01:00' }, end: { dateTime: '2026-10-26T11:00:00+01:00' } };
    const created = await cal.insertEvent(event);
    assert.equal(created.id, 'new1');
    const call = fetchImpl.calls[1];
    assert.equal(call.init.method, 'POST');
    assert.equal(call.init.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(call.init.body), event);
    assert.equal(new URL(call.url).searchParams.get('sendUpdates'), 'none');
  });

  test('listEvents: eventType i attendees w polach; privateExtendedProperty; bez timeMax', async () => {
    const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : jsonResponse(200, { items: [] })));
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await cal.listEvents({ timeMin: '2026-10-26T00:00:00Z', privateProperty: { source: 'www', treatment: 'korekta' } });
    const url = new URL(fetchImpl.calls[1].url);
    assert.match(url.searchParams.get('fields'), /eventType/);
    assert.match(url.searchParams.get('fields'), /attendees\(self,responseStatus\)/);
    assert.deepEqual(url.searchParams.getAll('privateExtendedProperty'), ['source=www', 'treatment=korekta']);
    assert.equal(url.searchParams.has('timeMax'), false);
  });

  test('getEvent: 404/410 → null; insertEvent przekazuje id wydarzenia; 409 → CalendarApiError 409', async () => {
    for (const status of [404, 410]) {
      const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : new Response(null, { status })));
      const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
      assert.equal(await cal.getEvent('abc'), null);
    }
    const fetchImpl = fakeFetch((call) =>
      isToken(call) ? tokenOk() : jsonResponse(409, { error: { code: 409, errors: [{ reason: 'duplicate' }] } })
    );
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
    await assert.rejects(cal.insertEvent({ id: 'abcdef0123', summary: 'x' }), (err) => err instanceof CalendarApiError && err.status === 409);
    assert.equal(JSON.parse(fetchImpl.calls[1].init.body).id, 'abcdef0123');
  });

  test('łączny budżet (signal) przerywa wywołanie przed timeoutem pojedynczego żądania', async () => {
    const fetchImpl = fakeFetch(
      (call) =>
        new Promise((resolve, reject) => {
          if (isToken(call)) return resolve(tokenOk());
          call.init.signal.addEventListener('abort', () => reject(call.init.signal.reason));
        })
    );
    const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl, timeoutMs: 60_000 });
    const keepAlive = setInterval(() => {}, 1000);
    try {
      await assert.rejects(cal.freeBusy({ timeMin: 0, timeMax: 1, signal: AbortSignal.timeout(30) }), CalendarTimeoutError);
      const aborted = AbortSignal.abort();
      await assert.rejects(cal.listEvents({ timeMin: 0, timeMax: 1, signal: aborted }), CalendarTimeoutError);
    } finally {
      clearInterval(keepAlive);
    }
  });

  test('deleteEvent: 204 ok, 410/404 traktowane jako już usunięte', async () => {
    for (const status of [204, 404, 410]) {
      const fetchImpl = fakeFetch((call) => (isToken(call) ? tokenOk() : new Response(null, { status })));
      const cal = createGoogleCalendar({ clientEmail: EMAIL, privateKey: ENV_STYLE_KEY, calendarId: CALENDAR, fetchImpl });
      await cal.deleteEvent('abc');
      assert.equal(fetchImpl.calls[1].init.method, 'DELETE');
      assert.ok(fetchImpl.calls[1].url.includes('/events/abc?'));
    }
  });
});
