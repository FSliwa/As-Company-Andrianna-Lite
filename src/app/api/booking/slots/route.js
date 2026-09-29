/**
 * GET /api/booking/slots?date=YYYY-MM-DD&treatment=<id>
 * GET /api/booking/slots?month=YYYY-MM&treatment=<id>
 *
 * Logika w src/lib/booking/handlers.js (import względny — trasa daje się
 * zaimportować także poza Next.js, np. w testach dymnych).
 */

import { handleSlotsGet } from '../../../../lib/booking/handlers.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Limit czasu funkcji na hostingu (s) — budżet zapytań do Google: 15 s (config.timeouts.slotsMs).
export const maxDuration = 20;

export async function GET(request) {
  return handleSlotsGet(request);
}
