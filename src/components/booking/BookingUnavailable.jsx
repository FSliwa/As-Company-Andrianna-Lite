'use client';

/**
 * Rezerwacja online wyłączona (API 503 / brak konfiguracji kalendarza):
 * uczciwy komunikat + kontakt i Instagram. Bez udawania formularza.
 */

import { forwardRef } from 'react';
import Link from 'next/link';
import { CONTACT } from '@/lib/site';

export const BookingUnavailable = forwardRef(function BookingUnavailable(_, headingRef) {
  return (
    <div role="status" className="max-w-4xl border border-ink/15 bg-cream-100 px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
      <div className="max-w-2xl">
        <h2 ref={headingRef} tabIndex={-1} className="as-title as-text-balance text-ink focus-visible:outline-none">
          Rezerwacja online jest chwilowo niedostępna.
        </h2>
        <p className="as-body mt-5">
          Termin ustalimy z Tobą bezpośrednio — napisz na Instagramie {CONTACT.instagramHandle} albo przejdź
          do strony kontaktowej.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-solid w-full whitespace-normal px-5 text-center focus-visible:outline-ink sm:w-auto sm:px-8">
            Napisz na Instagramie
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
          <Link href="/kontakt" className="as-btn-ghost w-full px-5 sm:w-auto sm:px-8">
            Kontakt
          </Link>
        </div>
      </div>
    </div>
  );
});
