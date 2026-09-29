'use client';

/**
 * Filtry katalogu: kolekcja i strefa (przyciski aria-pressed w grupach)
 * oraz wyszukiwarka po nazwie odcienia.
 *
 * Chip kolekcji ma u dołu pasek jej odcieni (poglądowo, bez zestawów) —
 * paleta kolekcji stoi tam, gdzie się ją wybiera.
 *
 * Poniżej lg rzędy przewijają się w bok (telefon, tablet: gest), a krawędź
 * z ukrytą treścią wygasza maska — tylko gdy po tej stronie naprawdę coś
 * jest. Od lg rzędy się zawijają: bez ukrytych chipów i bez przewijania
 * w bok, którego mysz bez gładzika nie obsłuży.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

function Chip({ pressed, onClick, children, controls, palette }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-controls={controls}
      onClick={onClick}
      className={cn(
        'as-label relative inline-flex h-11 shrink-0 items-center overflow-hidden whitespace-nowrap border px-4 transition-colors focus-visible:outline-ink',
        pressed
          ? 'border-ink bg-ink text-cream-50'
          : 'border-ink/20 text-ink/80 hover:border-ink hover:text-ink'
      )}
    >
      {children}
      {palette?.length > 0 && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-[3px]">
          {palette.map((c, i) => (
            <span key={`${c}-${i}`} className="h-full flex-1" style={{ backgroundColor: c }} />
          ))}
        </span>
      )}
    </button>
  );
}

/* Wygaszenie krawędzi przewijanego rzędu (maska tylko po stronie z ukrytą treścią). */
function useEdgeFade() {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    /* od lg rząd się zawija (scrollWidth = clientWidth) — maska sama znika */
    const max = el.scrollWidth - el.clientWidth;
    const next = { left: el.scrollLeft > 2, right: max - el.scrollLeft > 2 };
    setEdges((prev) => (prev.left === next.left && prev.right === next.right ? prev : next));
  }, []);

  /* liczba chipów zmienia się z filtrem (strefy) — mierz po każdym renderze;
     setEdges bez zmiany zwraca poprzedni obiekt, więc nie ma pętli */
  useEffect(() => {
    measure();
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const l = edges.left ? 'transparent 0, #000 2rem' : '#000 0';
  const r = edges.right ? '#000 calc(100% - 3rem), transparent 100%' : '#000 100%';
  const mask = `linear-gradient(to right, ${l}, ${r})`;
  const style = edges.left || edges.right ? { WebkitMaskImage: mask, maskImage: mask } : undefined;
  return { ref, style };
}

function Row({ label, children, scroll = false, fadeRef, fadeStyle }) {
  return (
    /* baseline: etykieta w linii z PIERWSZYM rzędem chipów, gdy się zawijają */
    <div className="grid gap-3 lg:grid-cols-[7rem_minmax(0,1fr)] lg:items-baseline lg:gap-6">
      <p className="as-kicker" aria-hidden="true">
        {label}
      </p>
      <div
        role="group"
        aria-label={label}
        ref={fadeRef}
        style={fadeStyle}
        className={cn(
          'flex gap-2',
          scroll
            /* py-1.5: przewijany rząd przycina też w pionie — zostaw miejsce na obwódkę fokusu;
               od lg: zawijanie, bez przewijania i bez przycinania */
            ? 'as-noscrollbar -mx-5 -my-1.5 overflow-x-auto px-5 py-1.5 sm:-mx-8 sm:px-8 lg:m-0 lg:flex-wrap lg:overflow-visible lg:p-0'
            : 'flex-wrap'
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* Aktywny chip zawsze w kadrze rzędu (np. po wyborze z sekcji „Kolekcje”). */
function useKeepActiveInView(ref, dep) {
  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector('[aria-pressed="true"]');
    if (!row || !active) return;
    const left = active.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + active.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: Math.max(0, left - 24) });
    }
  }, [ref, dep]);
}

export default function CatalogFilters({
  collections,
  palettes = {},
  collection,
  onCollection,
  zones,
  zone,
  onZone,
  query,
  onQuery,
  controls,
}) {
  const fadeC = useEdgeFade();
  const fadeZ = useEdgeFade();
  useKeepActiveInView(fadeC.ref, collection);
  useKeepActiveInView(fadeZ.ref, `${zone}|${zones.length}`);

  return (
    <div className="space-y-5">
      <Row label="Kolekcja" scroll fadeRef={fadeC.ref} fadeStyle={fadeC.style}>
        <Chip pressed={!collection} onClick={() => onCollection(null)} controls={controls}>
          Wszystkie
        </Chip>
        {collections.map((c) => (
          <Chip
            key={c.id}
            pressed={collection === c.id}
            onClick={() => onCollection(c.id)}
            controls={controls}
            palette={palettes[c.id]}
          >
            {c.name}
          </Chip>
        ))}
      </Row>

      {/* strefy: tylko te, które występują w wybranej kolekcji */}
      <Row label="Strefa" scroll fadeRef={fadeZ.ref} fadeStyle={fadeZ.style}>
        <Chip pressed={!zone} onClick={() => onZone(null)} controls={controls}>
          Wszystkie
        </Chip>
        {zones.map((z) => (
          <Chip key={z.id} pressed={zone === z.id} onClick={() => onZone(z.id)} controls={controls}>
            {z.name}
          </Chip>
        ))}
      </Row>

      <div className="grid gap-3 lg:grid-cols-[7rem_minmax(0,1fr)] lg:items-center lg:gap-6">
        <label htmlFor="pig-search" className="as-kicker">
          Szukaj
        </label>
        <div className="relative max-w-[26rem]">
          <Search aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
          <input
            id="pig-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Nazwa odcienia, np. Brazil"
            autoComplete="off"
            enterKeyHint="search"
            aria-controls={controls}
            className="block h-11 w-full rounded-none border-0 border-b border-ink/40 bg-transparent pl-7 pr-0 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-mocha focus:border-ink focus:shadow-[0_1px_0_0_#241B14] sm:text-[0.9375rem]"
          />
        </div>
      </div>
    </div>
  );
}
