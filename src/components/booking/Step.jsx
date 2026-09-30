'use client';

/**
 * Krok przepływu rezerwacji: hairline u góry, numer (as-num) + tytuł
 * (as-numbered-title) jako <legend><h2>, opcjonalny podpis i błąd.
 * `aside` (np. strzałki paska dni) stoi w prawym górnym rogu kroku.
 * Odstęp pod przyklejonym nagłówkiem przy przewijaniu do kroku daje
 * html { scroll-padding-top } (index.css) – krok nie ma własnego scroll-mt.
 */

import { cn } from '@/lib/utils';

export function Step({ id, number, title, caption, error, aside, disabled = false, children, className }) {
  const captionId = caption ? `${id}-caption` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [captionId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div id={id} className={cn('relative border-t border-ink/15 pt-6', className)}>
      <fieldset disabled={disabled} aria-describedby={describedBy} className="min-w-0">
        <legend className={cn('w-full p-0', aside && 'pr-28')}>
          {/* Skrypt przenosi tu fokus (Enter w poprzednim kroku, błąd z API) – wskaźnik musi być widoczny. */}
          <h2 id={`${id}-title`} tabIndex={-1} className="flex items-baseline gap-3 focus-visible:outline-ink">
            <span className="as-num">{number}</span>
            <span className="as-numbered-title text-ink">{title}</span>
          </h2>
        </legend>
        {aside && <div className="absolute right-0 top-4">{aside}</div>}
        {caption && (
          <p id={captionId} className="as-caption mt-3 max-w-[36rem]">
            {caption}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-3 text-[0.9375rem] leading-relaxed text-destructive">
            {error}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </fieldset>
    </div>
  );
}
