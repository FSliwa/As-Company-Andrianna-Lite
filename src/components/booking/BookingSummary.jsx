'use client';

/**
 * Podsumowanie wyboru: zabieg, dzień, godzina, czas, cena.
 * Desktop i tablet: prawa kolumna (sticky, ustawia widok). Telefon: nad przyciskiem;
 * bez wiersza „Czas” (zakres godzin w wierszu „Godzina” mówi to samo) i z mniejszym
 * wewnętrznym marginesem – podsumowanie niższe o ~55 px.
 * `children` = przycisk „Zarezerwuj wizytę” + komunikaty i klauzula.
 */

import { getTreatment, shownDurationMin } from '@/lib/booking/config';
import { cn } from '@/lib/utils';
import { formatDateLong, formatDuration, keepTogether, timeRange } from './format';

function Row({ label, children, empty, className }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-x-6 gap-y-1 border-t border-ink/15 py-3', className)}>
      <dt className="as-label shrink-0 text-ink/65">{label}</dt>
      <dd className={cn('min-w-0 text-right text-[0.9375rem]', empty ? 'text-mocha' : 'text-ink')}>{children}</dd>
    </div>
  );
}

export function BookingSummary({ treatment, date, time, children }) {
  const t = getTreatment(treatment);
  return (
    <div className="border border-ink/15 bg-cream-100 p-5 sm:p-8">
      <h2 id="b-summary-title" className="as-label text-ink/70">
        Podsumowanie
      </h2>
      <dl className="mt-5 border-b border-ink/15">
        <Row label="Zabieg" empty={!t}>
          {/* Bodoni ≥ 22 px */}
          {t ? <span className="font-display text-[1.375rem] leading-tight">{keepTogether(t.name)}</span> : 'Nie wybrano'}
        </Row>
        <Row label="Dzień" empty={!date}>
          {date ? formatDateLong(date) : 'Nie wybrano'}
        </Row>
        <Row label="Godzina" empty={!time}>
          {/* D6: koniec wizyty tylko przy czasie potwierdzonym źródłem; inaczej sama godzina rozpoczęcia */}
          {time ? timeRange(time, shownDurationMin(t) || 0, date) : 'Nie wybrano'}
        </Row>
        {(!t || shownDurationMin(t)) && (
          <Row label="Czas" empty={!t} className="max-sm:hidden">
            {t ? formatDuration(shownDurationMin(t)) : '–'}
          </Row>
        )}
        <Row label="Cena" empty={!t || !t.price}>
          {t && t.price ? (
            <>
              <span className="whitespace-nowrap font-display text-[1.375rem]">{t.price}</span>
              {t.priceNote && <span className="mt-1 block text-[0.8125rem] leading-snug text-mocha">{t.priceNote}</span>}
            </>
          ) : (
            '–'
          )}
        </Row>
      </dl>
      {children}
    </div>
  );
}
