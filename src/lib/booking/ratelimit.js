/**
 * Best-effort limit żądań w pamięci (okno przesuwne per klucz).
 *
 * UWAGA: w środowisku serverless każda instancja ma własny licznik, a restart
 * go zeruje – na produkcji zalecany limit na brzegu (Vercel Firewall / Cloudflare).
 * Poza Vercelem limit na brzegu jest WYMAGANY (patrz docs/rezerwacje-google.md).
 * Adresów IP NIE logujemy (to dane osobowe).
 */

import net from 'node:net';

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }) {
  // key → number[] (znaczniki czasu, rosnąco). Kolejność Map = ostatnie użycie
  // (każde sprawdzenie przenosi klucz na koniec) – przy przepełnieniu usuwamy
  // najdawniej używane klucze, a nie wszystkie liczniki naraz.
  const hits = new Map();

  function expire(list, now) {
    while (list.length && list[0] <= now - windowMs) list.shift();
  }

  function evict(now) {
    for (const [key, list] of hits) {
      expire(list, now);
      if (!list.length) hits.delete(key);
    }
    const target = Math.max(1, Math.floor(maxKeys * 0.9));
    for (const key of hits.keys()) {
      if (hits.size <= target) break;
      hits.delete(key);
    }
  }

  return {
    /**
     * Rejestruje próbę i zwraca, czy mieści się w limicie.
     * @returns {{ ok: boolean, remaining: number, retryAfterSec: number }}
     */
    check(key, now = Date.now()) {
      const list = hits.get(key) || [];
      hits.delete(key);
      expire(list, now);
      let result;
      if (list.length >= limit) {
        const retryAfterSec = Math.max(1, Math.ceil((list[0] + windowMs - now) / 1000));
        result = { ok: false, remaining: 0, retryAfterSec };
      } else {
        list.push(now);
        result = { ok: true, remaining: limit - list.length, retryAfterSec: 0 };
      }
      hits.set(key, list);
      if (hits.size > maxKeys) evict(now);
      return result;
    },
    reset() {
      hits.clear();
    },
    get size() {
      return hits.size;
    },
  };
}

/* ---------------- klucz klienta ---------------- */

const WARN_STORE = Symbol.for('as-company.booking.ratelimit.warned');

function warnOnce(message) {
  if (globalThis[WARN_STORE]) return;
  globalThis[WARN_STORE] = true;
  console.warn(`[booking] ${message}`);
}

function listOf(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Surowy adres klienta z nagłówka, któremu wolno ufać w danym hostingu:
 *  - BOOKING_CLIENT_IP_HEADER (np. cf-connecting-ip za Cloudflare, x-real-ip za nginx
 *    z `proxy_set_header X-Real-IP $remote_addr`) – dokładnie ten nagłówek;
 *    dla x-forwarded-for ostatni wpis (dopisany przez nasze proxy),
 *  - Vercel (zmienna VERCEL): x-real-ip / x-vercel-forwarded-for – Vercel nadpisuje
 *    te nagłówki, klient ich nie podrobi,
 *  - nic nie skonfigurowano: dotychczasowe zachowanie (x-real-ip, ostatni wpis
 *    x-forwarded-for) – klient może je podrobić, więc w production raz ostrzegamy w logu.
 */
export function clientIp(headers, env = process.env) {
  const configured = String(env.BOOKING_CLIENT_IP_HEADER || '').trim().toLowerCase();
  if (configured) {
    const values = listOf(headers.get(configured));
    if (!values.length) return null;
    return configured === 'x-forwarded-for' ? values[values.length - 1] : values[0];
  }
  if (env.VERCEL) {
    return listOf(headers.get('x-real-ip'))[0] || listOf(headers.get('x-vercel-forwarded-for'))[0] || listOf(headers.get('x-forwarded-for'))[0] || null;
  }
  if (env.NODE_ENV === 'production') {
    warnOnce('BOOKING_CLIENT_IP_HEADER is not set outside Vercel – the per-IP rate limit trusts client-supplied headers; configure an edge rate limit');
  }
  const real = listOf(headers.get('x-real-ip'))[0];
  if (real) return real;
  const xff = listOf(headers.get('x-forwarded-for'));
  return xff.length ? xff[xff.length - 1] : null;
}

/** Pierwsze 64 bity adresu IPv6 ('2001:db8:abcd:12') albo null. */
function ipv6Prefix64(ip) {
  let s = ip.toLowerCase();
  const tail4 = /^(.*:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (tail4) {
    const [a, b, c, d] = tail4.slice(2).map(Number);
    s = `${tail4[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  let parts = head;
  if (halves.length === 2) {
    const tail = halves[1] ? halves[1].split(':') : [];
    parts = [...head, ...Array(Math.max(0, 8 - head.length - tail.length)).fill('0'), ...tail];
  }
  if (parts.length !== 8) return null;
  return parts.map((h) => parseInt(h, 16).toString(16));
}

/**
 * Adres → klucz limitu: IPv4 cały, IPv6 – sieć /64 (jedno łącze domowe dostaje
 * całą /64, więc liczenie po pełnym adresie dawałoby 2^64 kubełków). Porty,
 * nawiasy i strefy są usuwane. Nie-adres → null.
 */
export function normalizeIpKey(raw) {
  let s = String(raw || '').trim();
  if (!s) return null;
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(s);
  if (bracketed) s = bracketed[1];
  else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(s)) s = s.slice(0, s.lastIndexOf(':'));
  s = s.replace(/%.*$/, '');
  if (net.isIPv4(s)) return `v4:${s}`;
  if (!net.isIPv6(s)) return null;
  const parts = ipv6Prefix64(s);
  if (!parts) return null;
  // IPv4 zapisany jako IPv6 (::ffff:1.2.3.4) = zwykły IPv4.
  if (parts.slice(0, 5).every((p) => p === '0') && parts[5] === 'ffff') {
    const a = parseInt(parts[6], 16);
    const b = parseInt(parts[7], 16);
    return `v4:${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`;
  }
  return `v6:${parts.slice(0, 4).join(':')}::/64`;
}

/**
 * Klucz klienta do limitu. Brak nagłówka → 'unknown' (wspólny kubełek),
 * wartość niebędąca adresem IP → 'invalid' (wspólny kubełek dla śmieci).
 */
export function clientKey(headers, env = process.env) {
  const raw = clientIp(headers, env);
  if (!raw) return 'unknown';
  return normalizeIpKey(raw) || 'invalid';
}

const STORE_KEY = Symbol.for('as-company.booking.ratelimit');

/** Współdzielone limitery (globalThis – jedna instancja na proces, także w dev). */
export function sharedLimiter(name, options) {
  if (!globalThis[STORE_KEY]) globalThis[STORE_KEY] = new Map();
  const store = globalThis[STORE_KEY];
  const id = `${name}:${options.limit}:${options.windowMs}`;
  if (!store.has(id)) store.set(id, createRateLimiter(options));
  return store.get(id);
}
