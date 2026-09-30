'use client';

/**
 * 01 Zabieg – natywne <input type="radio"> (Tab wchodzi do grupy, strzałki
 * zmieniają wybór) stylowane jako wiersze-karty: nazwa as-title, cena i czas
 * z konfiguracji (ceny pochodzą z cenników site.js). Czas tylko potwierdzony
 * źródłem (D6: shownDurationMin) – robocze czasy blokady nie są pokazywane jako fakt.
 *
 * Wybór wskaźnikiem (mysz, palec): `onPointerPick` – widok przewija do kroku 02,
 * a na telefonie lista zwija się do wybranego wiersza (`collapsed`) z linkiem
 * „Zmień zabieg”. Klawiatura (strzałki, spacja) tego nie robi: syntetyczne
 * kliknięcie z pola radio ma `detail === 0`, prawdziwe – `detail ≥ 1`.
 */

import { ArrowLink } from '@/components/as/Primitives';
import { TREATMENTS, shownDurationMin } from '@/lib/booking/config';
import { cn } from '@/lib/utils';
import { formatDuration, keepTogether } from './format';

export function TreatmentPicker({ value, onChange, onEnter, onPointerPick, collapsed = false, onExpand, invalid }) {
  /* zwinięcie tylko przy wybranym zabiegu i tylko poniżej sm (klasa max-sm:hidden) */
  const folded = collapsed && Boolean(value);
  return (
    <>
      <ul id="b-treatments" className="border-t border-ink/15">
        {TREATMENTS.map((t) => {
          const checked = value === t.id;
          return (
            <li key={t.id} className={cn(folded && !checked && 'max-sm:hidden')}>
              <label
                onClick={(e) => {
                  /* tylko prawdziwe kliknięcie (detail ≥ 1); handler bywa wołany dwa razy
                     (label + syntetyczne kliknięcie pola) – drugi raz ma detail 0 */
                  if (e.detail > 0) onPointerPick?.(t.id);
                }}
                className={cn(
                  'relative flex cursor-pointer items-start gap-4 border-b border-ink/15 px-3 py-5 transition-colors min-[360px]:px-4 sm:items-center sm:px-5',
                  /* fokus klawiatury na całym wierszu (obrys wewnątrz, właściwość arbitralna) */
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
                    // Enter: na niewybranym zabiegu – wybiera go (bez skoku do wyłączonego kroku 02);
                    // na wybranym – przejście do dni.
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
                    <span className="as-title block text-ink">{keepTogether(t.name)}</span>
                    {/* D2: podpis techniki z briefu, np. „Pigmentacja linii rzęs” przy Perfect Eyes */}
                    {t.hint && <span className="mt-1 block text-[0.8125rem] leading-relaxed text-mocha">{t.hint}</span>}
                    {t.priceNote && <span className="mt-1 block text-[0.8125rem] leading-relaxed text-mocha">{t.priceNote}</span>}
                  </span>
                  <span className="mt-2 flex items-baseline gap-4 sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
                    {/* Bodoni ≥ 22 px */}
                    {t.price && <span className="whitespace-nowrap font-display text-[1.375rem] leading-tight text-ink">{t.price}</span>}
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
      {/* telefon po wyborze wskaźnikiem: pozostałe zabiegi schowane – link je przywraca */}
      {folded && (
        <ArrowLink onClick={onExpand} aria-controls="b-treatments" aria-expanded={false} className="mt-5 w-fit sm:hidden">
          Zmień zabieg
        </ArrowLink>
      )}
    </>
  );
}
