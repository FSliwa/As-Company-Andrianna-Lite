import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { clientKey, createRateLimiter } from './ratelimit.js';

describe('createRateLimiter', () => {
  test('limit w oknie, Retry-After, reset po upływie okna', () => {
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const t = 1_000_000;
    assert.equal(rl.check('a', t).ok, true);
    assert.equal(rl.check('a', t + 1).ok, true);
    const third = rl.check('a', t + 2);
    assert.equal(third.ok, true);
    assert.equal(third.remaining, 0);
    const fourth = rl.check('a', t + 10_000);
    assert.equal(fourth.ok, false);
    assert.equal(fourth.retryAfterSec, 50);
    assert.equal(rl.check('b', t + 10_000).ok, true, 'inne klucze niezależne');
    assert.equal(rl.check('a', t + 60_000).ok, true, 'pierwsze trafienie wygasło (okno przesuwne)');
    assert.equal(rl.check('a', t + 60_001).ok, true);
    assert.equal(rl.check('a', t + 60_002).ok, true);
    assert.equal(rl.check('a', t + 60_003).ok, false);
  });
  test('odrzucone próby nie wydłużają blokady', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    rl.check('a', 0);
    for (let i = 1; i < 10; i += 1) assert.equal(rl.check('a', i * 50).ok, false);
    assert.equal(rl.check('a', 1000).ok, true);
  });
  test('mapa kluczy nie rośnie bez końca', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 100 });
    for (let i = 0; i < 1000; i += 1) rl.check(`k${i}`, i * 10);
    assert.ok(rl.size <= 101);
  });
});

describe('clientKey', () => {
  const h = (obj) => new Headers(obj);
  test('bez konfiguracji (dev): x-real-ip, potem ostatni wpis x-forwarded-for', () => {
    assert.equal(clientKey(h({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' }), {}), 'v4:1.2.3.4');
    assert.equal(clientKey(h({ 'x-forwarded-for': 'spoofed, 5.6.7.8' }), {}), 'v4:5.6.7.8');
  });
  test('brak nagłówków → unknown; wartość niebędąca adresem → wspólny kubełek invalid', () => {
    assert.equal(clientKey(h({}), {}), 'unknown');
    assert.equal(clientKey(h({ 'x-real-ip': 'dowolny-tekst-klienta' }), {}), 'invalid');
    assert.equal(clientKey(h({ 'x-real-ip': 'inny-tekst' }), {}), 'invalid');
  });
  test('BOOKING_CLIENT_IP_HEADER: tylko wskazany nagłówek (np. cf-connecting-ip), podrobione x-real-ip ignorowane', () => {
    const env = { BOOKING_CLIENT_IP_HEADER: 'cf-connecting-ip', NODE_ENV: 'production' };
    assert.equal(clientKey(h({ 'cf-connecting-ip': '203.0.113.7', 'x-real-ip': '1.1.1.1' }), env), 'v4:203.0.113.7');
    assert.equal(clientKey(h({ 'x-real-ip': '1.1.1.1' }), env), 'unknown');
    const xff = { BOOKING_CLIENT_IP_HEADER: 'x-forwarded-for' };
    assert.equal(clientKey(h({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }), xff), 'v4:203.0.113.9', 'ostatni wpis = nasze proxy');
  });
  test('Vercel: x-real-ip / x-vercel-forwarded-for (nadpisywane przez Vercel)', () => {
    assert.equal(clientKey(h({ 'x-real-ip': '198.51.100.1' }), { VERCEL: '1' }), 'v4:198.51.100.1');
    assert.equal(clientKey(h({ 'x-vercel-forwarded-for': '198.51.100.2' }), { VERCEL: '1' }), 'v4:198.51.100.2');
  });
  test('IPv6 → sieć /64 (cała sieć klientki w jednym kubełku); porty, nawiasy, ::ffff:', () => {
    const k = (ip) => clientKey(h({ 'x-real-ip': ip }), {});
    assert.equal(k('2001:db8:abcd:12::1'), 'v6:2001:db8:abcd:12::/64');
    assert.equal(k('2001:db8:abcd:12:ffff:1:2:3'), 'v6:2001:db8:abcd:12::/64');
    assert.equal(k('2001:0db8:abcd:0012:0:0:0:9'), 'v6:2001:db8:abcd:12::/64');
    assert.equal(k('[2001:db8:abcd:12::5]:443'), 'v6:2001:db8:abcd:12::/64');
    assert.equal(k('fe80::1%en0'), 'v6:fe80:0:0:0::/64');
    assert.equal(k('::ffff:203.0.113.5'), 'v4:203.0.113.5');
    assert.equal(k('203.0.113.5:51234'), 'v4:203.0.113.5');
    assert.equal(k('::1'), 'v6:0:0:0:0::/64');
  });
  test('50 adresów z jednej /64 → jeden kubełek → limit działa', () => {
    const rl = createRateLimiter({ limit: 5, windowMs: 600_000 });
    let blocked = 0;
    for (let i = 1; i <= 50; i += 1) {
      if (!rl.check(clientKey(h({ 'x-real-ip': `2001:db8:abcd:12::${i.toString(16)}` }), {}), 1000 + i).ok) blocked += 1;
    }
    assert.equal(blocked, 45);
  });
});

describe('createRateLimiter — przepełnienie', () => {
  test('po przekroczeniu maxKeys zablokowany (aktywny) klucz dalej jest zablokowany', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 600_000, maxKeys: 100 });
    assert.equal(rl.check('attacker', 0).ok, true);
    assert.equal(rl.check('attacker', 1).ok, false);
    for (let i = 0; i < 100; i += 1) {
      rl.check(`k${i}`, 10 + i);
      if (i % 10 === 0) assert.equal(rl.check('attacker', 10 + i).ok, false, `po ${i} kluczach`);
    }
    assert.equal(rl.check('attacker', 500).ok, false);
    assert.ok(rl.size <= 100);
  });
});
