/**
 * POST /api/booking — zapis wizyty w Kalendarzu Google salonu.
 *
 * Logika w src/lib/booking/handlers.js (import względny — trasa daje się
 * zaimportować także poza Next.js, np. w testach dymnych).
 */

import { handleBookingPost } from '../../../lib/booking/handlers.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Limit czasu funkcji na hostingu (s) — sprawdzenia i zapis mają łączny budżet 18 s + 5 s na kontrolę po zapisie (config.timeouts).
export const maxDuration = 30;

export async function POST(request) {
  return handleBookingPost(request);
}
