import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { CalendarConfigError } from './errors.js';
import { getBookingProvider, isBookingEnabled, resetBookingProviderForTests, resolveProviderName } from './provider.js';

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const GOOGLE = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'rezerwacje@test.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY: privateKey.trim().replace(/\n/g, '\\n'),
  GOOGLE_CALENDAR_ID: 'salon@example.com',
};

describe('wybór dostawcy', () => {
  beforeEach(() => resetBookingProviderForTests());

  test('brak zmiennych → wyłączone (null)', () => {
    assert.equal(resolveProviderName({}), null);
    assert.equal(getBookingProvider({}), null);
    assert.equal(isBookingEnabled({}), false);
  });
  test('BOOKING_PROVIDER=google bez kompletu GOOGLE_* → wyłączone', () => {
    assert.equal(getBookingProvider({ BOOKING_PROVIDER: 'google', GOOGLE_CALENDAR_ID: 'x' }), null);
  });
  test('BOOKING_PROVIDER=google z kompletem → klient Google (jedna instancja)', () => {
    const env = { BOOKING_PROVIDER: 'google', ...GOOGLE };
    const a = getBookingProvider(env);
    assert.equal(a.kind, 'google');
    assert.equal(getBookingProvider(env), a);
  });
  test('komplet GOOGLE_* bez BOOKING_PROVIDER → google', () => {
    assert.equal(resolveProviderName(GOOGLE), 'google');
  });
  test('BOOKING_PROVIDER=off → wyłączone mimo zmiennych Google', () => {
    assert.equal(getBookingProvider({ BOOKING_PROVIDER: 'off', ...GOOGLE }), null);
  });
  test('memory w dev → ten sam obiekt między wywołaniami (globalThis)', () => {
    const env = { BOOKING_PROVIDER: 'memory', NODE_ENV: 'development' };
    const a = getBookingProvider(env);
    assert.equal(a.kind, 'memory');
    assert.equal(getBookingProvider(env), a);
  });
  test('memory w production → wyłączone', () => {
    assert.equal(getBookingProvider({ BOOKING_PROVIDER: 'memory', NODE_ENV: 'production' }), null);
    assert.equal(isBookingEnabled({ BOOKING_PROVIDER: 'memory', NODE_ENV: 'production' }), false);
  });
  test('zmienne obecne, ale e-mail nieprawidłowy → CalendarConfigError (handler → 502)', () => {
    assert.throws(() => getBookingProvider({ ...GOOGLE, GOOGLE_SERVICE_ACCOUNT_EMAIL: 'bez-malpy' }), CalendarConfigError);
  });
});
