'use client';

/**
 * Rezerwacja online wyłączona (API 503 / brak konfiguracji kalendarza):
 * uczciwy komunikat + kontakt i Instagram. Bez udawania formularza.
 * Jeden przycisk (Instagram) + link „Kontakt” (zasada 5): na telefonie link pod
 * przyciskiem, od sm w tym samym rzędzie.
 */

import { forwardRef } from 'react';
import { ArrowLink } from '@/components/as/Primitives';
import { CONTACT } from '@/lib/site';

export const BookingUnavailable = forwardRef(function BookingUnavailable(_, headingRef) {
  return (
    /* telefon: ciaśniejszy panel – przycisk „Napisz na Instagramie” w pierwszym ekranie przy 375×667 */
    <div role="status" className="max-w-4xl border border-ink/15 bg-cream-100 px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14">
      <div className="max-w-2xl">
        <h2 ref={headingRef} tabIndex={-1} className="as-title as-text-balance text-ink focus-visible:outline-none">
          Rezerwacja online jest chwilowo niedostępna.
        </h2>
        <p className="as-body mt-4 sm:mt-5">
          Termin ustalimy z Tobą bezpośrednio – napisz na Instagramie {CONTACT.instagramHandle} albo przejdź
          do strony kontaktowej.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-6 sm:mt-8">
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-solid w-full whitespace-normal px-5 text-center sm:w-auto sm:px-8">
            Napisz na Instagramie
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
          <ArrowLink href="/kontakt" className="w-fit">
            Kontakt
          </ArrowLink>
        </div>
      </div>
    </div>
  );
});
