'use client';

/**
 * 01 Zabieg — natywne <input type="radio"> (Tab wchodzi do grupy, strzałki
 * zmieniają wybór) stylowane jako wiersze-karty: nazwa as-title, cena i czas
 * z konfiguracji (ceny pochodzą z cenników site.js). Czas tylko potwierdzony
 * źródłem (D6: shownDurationMin) — robocze czasy blokady nie są pokazywane jako fakt.
 */

import { TREATMENTS, shownDurationMin } from '@/lib/booking/config';
import { cn } from '@/lib/utils';
import { formatDuration } from './format';

export function TreatmentPicker({ value, onChange, onEnter, invalid }) {
  return (
    <ul className="border-t border-ink/15">
      {TREATMENTS.map((t) => {
        const checked = value === t.id;
        return (
          <li key={t.id}>
            <label
              className={cn(
                'relative flex cursor-pointer items-start gap-4 border-b border-ink/15 px-4 py-5 transition-colors sm:items-center sm:px-5',
                /* fokus klawiatury na całym wierszu; właściwość arbitralna, bo cn()/tailwind-merge 3
                   usuwa `outline` stojący obok `outline-2` */
                'has-[:focus-visible]:[outline:2px_solid_#241B14] has-[:focus-visible]:[outline-offset:-2px]',
                checked ? 'bg-cream-100 shadow-[inset_3px_0_0_#B89768]' : 'hover:bg-cream-100/60'
              )}
            >
              <input
                type="radio"
                name="treatment"
                value={t.id}
                checked={checked}
                onChange={() => onChange(t.id)}
                onKeyDown={(e) => {
                  // Enter: na niewybranym zabiegu — wybiera go (bez skoku do wyłączonego kroku 02);
                  // na wybranym — przejście do dni.
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (checked) onEnter?.();
                    else onChange(t.id);
                  }
                }}
                aria-invalid={invalid || undefined}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'mt-2 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors sm:mt-0',
                  checked ? 'border-ink' : 'border-ink/40'
                )}
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full bg-ink transition-transform duration-200',
                    checked ? 'scale-100' : 'scale-0'
                  )}
                />
              </span>
              <span className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <span className="block min-w-0">
                  <span className="as-title block text-ink">{t.name}</span>
                  {/* D2: podpis techniki z briefu, np. „Pigmentacja linii rzęs” przy Perfect Eyes */}
                  {t.hint && <span className="mt-1 block text-[0.8125rem] leading-relaxed text-mocha">{t.hint}</span>}
                  {t.priceNote && <span className="mt-1 block text-[0.8125rem] leading-relaxed text-mocha">{t.priceNote}</span>}
                </span>
                <span className="mt-2 flex items-baseline gap-4 sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
                  {t.price && <span className="whitespace-nowrap font-display text-xl text-ink">{t.price}</span>}
                  {shownDurationMin(t) && (
                    <span className="as-label whitespace-nowrap text-ink/65">{formatDuration(shownDurationMin(t))}</span>
                  )}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
