#!/usr/bin/env node
/**
 * Masowe usuwanie wpisów ze strony www z Kalendarza Google (np. po zalaniu kalendarza
 * przez skrypt). Domyślnie TYLKO WYŚWIETLA listę — usuwa dopiero z flagą --delete.
 *
 * Użycie (w katalogu projektu, z tymi samymi zmiennymi co strona):
 *   node --env-file=.env.local src/lib/booking/cleanup-www.mjs --since 2026-10-05T12:00
 *   node --env-file=.env.local src/lib/booking/cleanup-www.mjs --since 2026-10-05T12:00 --until 2026-10-05T18:00 --delete
 *
 *   --since  (wymagane) utworzone od tej chwili (czas polski, albo ISO z offsetem / Z)
 *   --until  utworzone do tej chwili (domyślnie teraz)
 *   --delete naprawdę usuń (bez tej flagi — tylko podgląd)
 *
 * Wybiera wyłącznie wydarzenia z extendedProperties.private.source = 'www' (zapis ze strony),
 * których termin jeszcze się nie skończył. Wpisów dodanych ręcznie nie dotyka.
 * Nie wypisuje danych osobowych — tylko termin, zabieg i identyfikatory.
 */

import { BOOKING_CONFIG } from './config.js';
import { getBookingProvider } from './provider.js';
import { formatIsoWithOffset, zonedToUtc } from './time.js';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

/** '2026-10-05T12:00' (czas salonu) | ISO z offsetem → ms */
function parseMoment(value) {
  if (!value) return NaN;
  const local = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})$/.exec(value);
  if (local) {
    const d = zonedToUtc(local[1], local[2], BOOKING_CONFIG.timeZone);
    return d ? d.getTime() : NaN;
  }
  return Date.parse(value);
}

async function main() {
  const since = parseMoment(arg('since'));
  const until = arg('until') ? parseMoment(arg('until')) : Date.now();
  const doDelete = process.argv.includes('--delete');
  if (!Number.isFinite(since) || !Number.isFinite(until) || until < since) {
    console.error('Podaj --since (np. 2026-10-05T12:00) i ewentualnie --until późniejsze niż --since.');
    process.exit(2);
  }

  const provider = getBookingProvider(process.env);
  if (!provider) {
    console.error('Rezerwacja online nie jest skonfigurowana (brak zmiennych GOOGLE_* / BOOKING_PROVIDER).');
    process.exit(2);
  }

  const events = await provider.listEvents({ timeMin: new Date(), privateProperty: { source: 'www' } });
  const matches = (events || []).filter((e) => {
    const created = Date.parse(e.created);
    return e.status !== 'cancelled' && Number.isFinite(created) && created >= since && created <= until;
  });

  const tz = BOOKING_CONFIG.timeZone;
  console.log(`Wpisy ze strony www utworzone ${formatIsoWithOffset(since, tz)} – ${formatIsoWithOffset(until, tz)}: ${matches.length}`);
  for (const e of matches) {
    const p = (e.extendedProperties && e.extendedProperties.private) || {};
    const start = e.start && (e.start.dateTime || e.start.date);
    console.log(`  ${start}  ${p.treatment || '-'}  rezerwacja ${p.bookingId || '-'}  (id ${e.id})`);
  }
  if (!doDelete) {
    if (matches.length) console.log('\nTo był podgląd. Żeby usunąć te wpisy, uruchom ponownie z flagą --delete.');
    return;
  }

  let removed = 0;
  for (const e of matches) {
    try {
      await provider.deleteEvent(e.id);
      removed += 1;
    } catch (err) {
      console.error(`  nie udało się usunąć ${e.id}: ${err && err.name}`);
    }
  }
  console.log(`Usunięto: ${removed} z ${matches.length}.`);
}

main().catch((err) => {
  console.error('Błąd:', err && err.name, err && err.reason ? `(${err.reason})` : '');
  process.exit(1);
});
