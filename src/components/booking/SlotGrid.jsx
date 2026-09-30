'use client';

/**
 * 03 Godzina – siatka chipów (natywne radio) z godzinami rozpoczęcia.
 * Stany: brak zabiegu / brak dnia / ładowanie / lista / brak slotów
 * (+ „najbliższy wolny dzień”) / błąd / limit zapytań; nad siatką
 * komunikat 409 „Ten termin właśnie się zajął”.
 * `onPointerPick` – wybór godziny wskaźnikiem (detail ≥ 1): widok przewija do
 * kroku 04. Strzałki i spacja nie przewijają.
 */

import { forwardRef } from 'react';
import { ArrowLink } from '@/components/as/Primitives';
import { CONTACT } from '@/lib/site';
import { cn } from '@/lib/utils';
import { formatDateLong } from './format';

const Message = ({ children, className }) => (
  <p className={cn('max-w-[36rem] text-[0.9375rem] leading-[1.65] text-ink/80', className)}>{children}</p>
);

function NextFree({ nextFree, onPick, windowChecked }) {
  if (nextFree) {
    return (
      <ArrowLink onClick={() => onPick(nextFree)} className="mt-5 w-fit text-left">
        Najbliższy wolny dzień: {formatDateLong(nextFree)}
      </ArrowLink>
    );
  }
  if (!windowChecked) return null;
  return (
    <Message className="mt-4">
      W najbliższych tygodniach nie ma już wolnych terminów na ten zabieg – napisz do nas na Instagramie{' '}
      <a
        href={CONTACT.instagram}
        target="_blank"
        rel="noreferrer noopener"
        className="border-b border-ink/30 text-ink transition-colors hover:border-gold"
      >
        {CONTACT.instagramHandle}
        <span className="sr-only"> (otwiera się w nowej karcie)</span>
      </a>
      .
    </Message>
  );
}

export const TakenNotice = forwardRef(function TakenNotice(_, ref) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="mb-6 border-l-2 border-gold bg-cream-100 px-5 py-4 text-[0.9375rem] leading-[1.6] text-ink focus-visible:outline-ink"
    >
      {/* Komunikat pojawia się razem z ponownym pobraniem godzin – nie twierdzimy, że lista już jest świeża. */}
      <strong className="font-medium">Ten termin właśnie się zajął.</strong> Odświeżamy listę godzin – wybierz inną.
    </div>
  );
});

export function SlotGrid({
  status,
  slots = [],
  value,
  onChange,
  onEnter,
  onRetry,
  nextFree,
  windowChecked,
  onPickNextFree,
  onPointerPick,
  invalid,
}) {
  if (status === 'no-treatment') return <Message>Najpierw wybierz zabieg i dzień.</Message>;

  if (status === 'no-date') {
    return (
      <div>
        <Message>Wybierz dzień, a pokażemy wolne godziny.</Message>
        {nextFree && <NextFree nextFree={nextFree} onPick={onPickNextFree} windowChecked={windowChecked} />}
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <p className="sr-only">Sprawdzamy wolne godziny…</p>
        <div aria-hidden="true" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-12 animate-pulse border border-ink/10 bg-cream-200/50" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error' || status === 'rate_limited') {
    return (
      <div>
        <Message>
          {status === 'rate_limited'
            ? 'Za dużo zapytań w krótkim czasie. Odczekaj chwilę i spróbuj ponownie.'
            : 'Nie udało się pobrać wolnych godzin. Sprawdź połączenie i spróbuj ponownie.'}
        </Message>
        <ArrowLink onClick={onRetry} className="mt-5 w-fit">
          Spróbuj ponownie
        </ArrowLink>
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div>
        <Message>Brak wolnych godzin w tym dniu.</Message>
        <NextFree nextFree={nextFree} onPick={onPickNextFree} windowChecked={windowChecked} />
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {slots.map((time) => {
        const checked = value === time;
        return (
          <li key={time}>
            <label
              onClick={(e) => {
                if (e.detail > 0) onPointerPick?.(time);
              }}
              className={cn(
                'relative flex h-12 cursor-pointer items-center justify-center border text-[0.9375rem] tabular-nums transition-colors',
                'has-[:focus-visible]:[outline:2px_solid_#241B14] has-[:focus-visible]:[outline-offset:2px]',
                checked ? 'border-ink bg-ink text-cream-50' : 'border-ink/25 text-ink hover:border-ink'
              )}
            >
              <input
                type="radio"
                name="time"
                value={time}
                checked={checked}
                onChange={() => onChange(time)}
                onKeyDown={(e) => {
                  // Enter: na niewybranej godzinie – wybiera ją; na wybranej – przejście do danych.
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (checked) onEnter?.();
                    else onChange(time);
                  }
                }}
                aria-invalid={invalid || undefined}
                className="sr-only"
              />
              {time}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
