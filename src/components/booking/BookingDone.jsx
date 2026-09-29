'use client';

/**
 * Potwierdzenie (201): „Wizyta zapisana” + szczegóły + plik .ics.
 * Nie obiecujemy SMS-ów ani e-maili – serwis ich nie wysyła.
 */

import { forwardRef, useEffect, useState } from 'react';
import Link from '@/components/as/LocaleLink';
import { ArrowLink } from '@/components/as/Primitives';
import { ROUTES } from '@/i18n/routes';
import { SALON_LOCATION, getTreatment } from '@/lib/booking/config';
import { buildBookingIcs, icsFileName } from '@/lib/booking/ics';
import { CONTACT } from '@/lib/site';
import { SALON_TIME_NOTE, browserTimeZoneDiffers, formatDateLong, formatDuration } from './format';

function Row({ label, children }) {
  return (
    <div className="grid gap-1 border-t border-ink/15 py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
      <dt className="as-label pt-1 text-ink/65">{label}</dt>
      <dd className="min-w-0 text-[0.9375rem] leading-[1.6] text-ink">{children}</dd>
    </div>
  );
}

/** Blob URL pliku .ics – tworzony po stronie przeglądarki, zwalniany przy odmontowaniu. */
function useIcsUrl(booking) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let href = null;
    try {
      const blob = new Blob([buildBookingIcs(booking)], { type: 'text/calendar;charset=utf-8' });
      href = URL.createObjectURL(blob);
      setUrl(href);
    } catch {
      setUrl(null);
    }
    return () => {
      if (href) URL.revokeObjectURL(href);
    };
  }, [booking]);
  return url;
}

export const BookingDone = forwardRef(function BookingDone({ booking }, headingRef) {
  const t = getTreatment(booking.treatment);
  const date = String(booking.start).slice(0, 10);
  const from = String(booking.start).slice(11, 16);
  const to = String(booking.end).slice(11, 16);
  const icsUrl = useIcsUrl(booking);
  // Przeglądarka w innej strefie: godziny na stronie są polskie, a plik .ics pokaże czas lokalny.
  const [foreignZone, setForeignZone] = useState(false);
  useEffect(() => setForeignZone(browserTimeZoneDiffers()), []);

  return (
    <div className="border border-ink/15 bg-cream-100 px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-6">
          <p className="as-label text-gold-deep">Rezerwacja potwierdzona</p>
          <h2 ref={headingRef} tabIndex={-1} className="as-display-section as-text-balance mt-5 text-ink focus-visible:outline-none">
            Wizyta <span className="italic text-gold-dark">zapisana.</span>
          </h2>
          <p className="as-body mt-6">
            Termin jest już w kalendarzu salonu. Zapisz go też u siebie – nie wysyłamy SMS-ów ani e-maili
            z potwierdzeniem. Jeśli termin będzie wymagał zmiany, salon skontaktuje się z Tobą.
          </p>
          <p className="mt-4 text-[0.875rem] leading-relaxed text-mocha">
            Jak zmienić lub odwołać wizytę, opisuje{' '}
            <Link href={`${ROUTES.terms}#wizyta-w-salonie`} className="underline underline-offset-2 hover:text-ink">
              Regulamin (pkt 10)
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            {icsUrl ? (
              <a href={icsUrl} download={icsFileName(booking.start)} className="as-btn-solid w-full whitespace-normal px-5 text-center focus-visible:outline-ink sm:w-auto sm:px-8">
                Dodaj do kalendarza (.ics)
              </a>
            ) : null}
            <ArrowLink href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="w-fit">
              Pytania? {CONTACT.instagramHandle}
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </ArrowLink>
          </div>
        </div>

        <dl className="min-w-0 border-b border-ink/15 lg:col-span-5 lg:col-start-8 lg:self-end">
          <Row label="Zabieg">{t ? t.name : booking.treatment}</Row>
          <Row label="Termin">
            {formatDateLong(date, { year: true })}, {from}–{to}
            {foreignZone && (
              <span className="mt-1 block text-[0.8125rem] leading-snug text-mocha">
                {SALON_TIME_NOTE} Plik .ics doda wizytę w czasie Twojego urządzenia.
              </span>
            )}
          </Row>
          {t && <Row label="Czas">{formatDuration(t.durationMin)}</Row>}
          {t && t.price && (
            <Row label="Cena">
              {t.price}
              {t.priceNote && <span className="block text-[0.8125rem] text-mocha">{t.priceNote}</span>}
            </Row>
          )}
          {SALON_LOCATION && <Row label="Miejsce">{SALON_LOCATION}</Row>}
          <Row label="Nr rezerwacji">
            <span className="break-all text-[0.8125rem] tabular-nums text-ink/80">{booking.bookingId}</span>
          </Row>
        </dl>
      </div>
    </div>
  );
});
