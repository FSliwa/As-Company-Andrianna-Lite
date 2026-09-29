'use client';

/**
 * 02 Dzień — pasek dni od pierwszego możliwego terminu do dziś + 60 dni.
 * Natywne radio (strzałki pomijają dni wyłączone), przewijany w bok; przyciski
 * ←/→ przewijają o szerokość paska. Dni zamknięte i bez wolnych godzin są
 * wyszarzone i wyłączone (poza aktualnie wybranym).
 */

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { describeDate, formatDateLong } from './format';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Stan przewijania paska + akcje (callback ref, bo pasek pojawia się po montażu). */
export function useStripScroll() {
  const [node, setNode] = useState(null);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const update = useCallback(() => {
    if (!node) return;
    const prev = node.scrollLeft > 4;
    const next = node.scrollLeft + node.clientWidth < node.scrollWidth - 4;
    setEdges((e) => (e.prev === prev && e.next === next ? e : { prev, next }));
  }, [node]);

  useEffect(() => {
    if (!node) return undefined;
    update();
    node.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) {
      ro.observe(node);
      if (node.firstElementChild) ro.observe(node.firstElementChild);
    }
    return () => {
      node.removeEventListener('scroll', update);
      if (ro) ro.disconnect();
    };
  }, [node, update]);

  const page = useCallback(
    (dir) => {
      if (!node) return;
      node.scrollBy({ left: dir * Math.max(node.clientWidth * 0.8, 160), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [node]
  );

  /** Przewija poziomo tak, by dzień stał na środku paska (bez przewijania strony). */
  const centerOn = useCallback(
    (date) => {
      if (!node || !date) return;
      const item = node.querySelector(`[data-date="${date}"]`);
      if (!item) return;
      const left = item.offsetLeft - (node.clientWidth - item.offsetWidth) / 2;
      node.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [node]
  );

  return { ref: setNode, node, canPrev: edges.prev, canNext: edges.next, page, centerOn, update };
}

/* Obrys fokusu zawsze w kolorze ink — globalny :focus-visible bierze currentColor,
   a przycisk nieaktywny ma tekst ink/30 (kontrast obrysu ~1,9:1). */
const ARROW_BTN =
  'grid h-11 w-11 place-items-center border text-lg leading-none transition-colors focus-visible:outline-ink disabled:cursor-default disabled:border-ink/10 disabled:text-ink/30';

export function StripControls({ strip, controls }) {
  const btn = (dir, enabled, label, glyph) => (
    <button
      type="button"
      aria-controls={controls}
      aria-label={label}
      aria-disabled={!enabled || undefined}
      onClick={() => enabled && strip.page(dir)}
      className={cn(ARROW_BTN, enabled ? 'border-ink/25 text-ink hover:border-ink' : 'cursor-default border-ink/10 text-ink/30')}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
  return (
    <div className="flex gap-2">
      {btn(-1, strip.canPrev, 'Wcześniejsze dni', '←')}
      {btn(1, strip.canNext, 'Późniejsze dni', '→')}
    </div>
  );
}

export function DayStrip({ id, days, counts, value, onChange, onEnter, strip, busy, invalid }) {
  return (
    <div
      ref={strip.ref}
      id={id}
      className="as-noscrollbar relative -mx-5 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 py-1 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-1 lg:scroll-px-1 lg:px-1"
      aria-busy={busy || undefined}
    >
      <ul className="flex w-max snap-x snap-proximity">
        {days.map(({ date, closed }, i) => {
          const d = describeDate(date);
          const count = counts[date];
          const unavailable = closed || count === 0;
          const checked = value === date;
          const disabled = unavailable && !checked;
          const monday = d && d.weekdayShort === 'Pn';
          return (
            <li key={date} data-date={date} className={cn('shrink-0 snap-start', i > 0 && (monday ? 'ml-4' : 'ml-2'))}>
              <label
                className={cn(
                  'relative flex h-[5.5rem] w-[4.25rem] flex-col items-center justify-center gap-1.5 border transition-colors',
                  'has-[:focus-visible]:[outline:2px_solid_#241B14] has-[:focus-visible]:[outline-offset:2px]',
                  checked
                    ? 'border-ink bg-ink text-cream-50'
                    : disabled
                      ? 'cursor-not-allowed border-ink/10 text-ink/30'
                      : 'cursor-pointer border-ink/25 text-ink hover:border-ink'
                )}
              >
                <input
                  type="radio"
                  name="date"
                  value={date}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(date)}
                  onKeyDown={(e) => {
                    // Enter: na niewybranym dniu — wybiera go; na wybranym — przejście do godzin.
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (checked) onEnter?.();
                      else onChange(date);
                    }
                  }}
                  aria-invalid={invalid || undefined}
                  className="sr-only"
                />
                <span aria-hidden="true" className={cn('as-label', checked ? 'text-cream-100' : !disabled && 'text-ink/65')}>
                  {d.weekdayShort}
                </span>
                <span aria-hidden="true" className="font-display text-[1.625rem] leading-none">
                  {d.day}
                </span>
                <span aria-hidden="true" className={cn('as-label', checked ? 'text-cream-100' : !disabled && 'text-ink/65')}>
                  {d.monthShort}
                </span>
                <span className="sr-only">
                  {formatDateLong(date)}
                  {/* D6: godziny pracy salonu bez źródła — nie ogłaszamy „salon nieczynny” */}
                  {closed ? ' — brak terminów online' : count === 0 ? ' — brak wolnych godzin' : ''}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Szkielet paska przed montażem (daty liczymy dopiero w przeglądarce). */
export function DayStripSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-2 overflow-hidden py-1">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="h-[5.5rem] w-[4.25rem] shrink-0 animate-pulse border border-ink/10 bg-cream-200/50" />
      ))}
    </div>
  );
}
