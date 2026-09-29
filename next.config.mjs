/**
 * Rezerwacja online: czy przyciski „Umów wizytę” mają prowadzić do /umow-wizyte.
 * Ta sama logika co resolveProviderName() w src/lib/booking/provider.js — liczona
 * w chwili buildu, bo stała trafia też do komponentów klienckich
 * (NEXT_PUBLIC_BOOKING_ENABLED → BOOKING_ENABLED w src/lib/site.js).
 * Zmiana zmiennych na hostingu wymaga więc ponownego wdrożenia (Redeploy).
 */
function bookingEnabled(env) {
  const hasGoogle = Boolean(
    (env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim() &&
      (env.GOOGLE_PRIVATE_KEY || '').trim() &&
      (env.GOOGLE_CALENDAR_ID || '').trim()
  );
  const explicit = (env.BOOKING_PROVIDER || '').trim().toLowerCase();
  if (explicit === 'google') return hasGoogle;
  if (explicit === 'memory') return env.NODE_ENV !== 'production';
  if (explicit) return false;
  return hasGoogle;
}

/* Nagłówki bezpieczeństwa dla wszystkich tras. HSTS ustawia hosting (domena
   docelowa czeka na decyzję klienta), więc tu go nie wymuszamy. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Osobny katalog dla buildu audytowego (NEXT_DIST_DIR=.next-audit), żeby
  // `next build` nie nadpisywał .next działającego `next dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  env: {
    NEXT_PUBLIC_BOOKING_ENABLED: bookingEnabled(process.env) ? '1' : '',
  },
  // Serwis nie używa next/image (obrazy mają własne srcSet w WebP z public/graphics),
  // więc optymalizator obrazów i zdalne domeny są wyłączone.
  images: { unoptimized: true },
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/graphics/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
      { source: '/brand/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
    ];
  },
};

export default nextConfig;
