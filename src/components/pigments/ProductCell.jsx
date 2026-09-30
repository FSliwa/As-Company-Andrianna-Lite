'use client';

/**
 * Komórka odcienia i wiersz zestawu w katalogu /pigmenty.
 *
 * Obie w React.memo: dostają stabilne `onAdd` / `onDetails` (useCallback)
 * i liczbę sztuk TEGO produktu w zamówieniu – zmiana listy renderuje
 * od nowa tylko komórkę, której dotyczy, a nie całą siatkę.
 * Bez zdjęć ze sklepu: kolor to odcień poglądowy z danych (pasek 12 px na
 * telefonie, 8 px od sm).
 *
 * Telefon (< sm): komórka odcienia bez opisu (pełny opis jest w „Szczegółach”),
 * więc sześć odcieni startowych zajmuje ~1 ekran mniej. Wiersz zestawu: nazwa
 * i kicker na całą szerokość, pod nimi cena · kropki · „Dodaj”; sm–lg (jedna
 * kolumna, szeroki wiersz) jak cennik: nazwa · kropki · cena · akcja; od lg
 * (2–3 wąskie kolumny) bez kropek – nazwa bierze całe wolne miejsce. Komórka
 * akcji ma stałą szerokość („Dodaj” i „Brak w magazynie”), więc kwoty trzymają pion.
 */

import React, { memo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ArrowLink } from '@/components/as/Primitives';
import { cn } from '@/lib/utils';
import { collectionLabel, findVariant, formatCapacity } from '@/lib/pigments';
import {
  ADD_BTN,
  DOT,
  NBSP,
  PriceLine,
  Swatch,
  VariantPicker,
  defaultLabel,
  displayName,
  kickerFor,
  zonesText,
} from './parts';

function InOrder({ qty }) {
  if (!qty) return null;
  return (
    <p className="mb-2 text-[0.8125rem] text-gold-deep">
      W zamówieniu: {qty}
      {NBSP}szt.
    </p>
  );
}

function OutOfStock({ className }) {
  return <p className={cn('as-badge flex h-11 items-center', className)}>Brak w magazynie</p>;
}

/* ================================================================== */
/*  Odcień                                                             */
/* ================================================================== */

function ProductCellBase({ product, qty, onAdd, onDetails }) {
  const [label, setLabel] = useState(() => defaultLabel(product));
  const variant = findVariant(product, label);
  const multi = product.variants.length > 1;
  const canAdd = Boolean(product.inStock && variant?.inStock);
  const titleId = `pig-${product.id}`;
  const addName = [product.name, variant?.label ? formatCapacity(variant.label) : null].filter(Boolean).join(', ');

  return (
    <article aria-labelledby={titleId} className="as-cell flex h-full min-w-0 flex-col">
      <p className="as-kicker">{kickerFor(product)}</p>
      <h3 id={titleId} className="as-title as-text-balance mt-3 break-words text-ink">
        {displayName(product.name)}
      </h3>

      {/* próbka: pasek pod nazwą (12 px na telefonie – bez opisu to główna informacja
          o kolorze, 8 px od sm); bez koloru – kreskowanie i podpis */}
      <div className="mt-4 flex items-center gap-3">
        <Swatch color={product.color} className="h-3 flex-1 sm:h-2" />
        {!product.color && <span className="as-label shrink-0 text-ink/65">bez próbki</span>}
      </div>

      {/* opis od sm; na telefonie pełny opis w „Szczegółach” */}
      {product.shortDesc && (
        <p className="mt-4 line-clamp-2 hidden text-[0.9375rem] leading-[1.6] text-ink/75 sm:block">
          {product.shortDesc}
        </p>
      )}

      {/* akcje: [pojemność] [Dodaj] [Szczegóły] – zawijają się, gdy komórka jest wąska */}
      {/* blok akcji wyrównany do dołu komórki; „W zamówieniu” rośnie w górę,
          więc ceny i przyciski w rzędzie siatki zostają na jednej linii */}
      <div className="mt-auto pt-5">
        <InOrder qty={qty} />
        <PriceLine variants={product.variants} showStock={product.inStock && multi} />
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-3">
          {multi && product.inStock && (
            <VariantPicker product={product} value={label} onChange={setLabel} name={`cap-${product.id}`} note={false} />
          )}
          {canAdd ? (
            <button
              type="button"
              onClick={() => onAdd(product.id, variant.label ?? null)}
              aria-label={`Dodaj do zamówienia: ${addName}`}
              className={ADD_BTN}
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Dodaj
            </button>
          ) : (
            <OutOfStock />
          )}
          <ArrowLink onClick={() => onDetails(product.id)} aria-haspopup="dialog" className="w-fit">
            Szczegóły<span className="sr-only">: {product.name}</span>
          </ArrowLink>
        </div>
      </div>
    </article>
  );
}

export const ProductCell = memo(ProductCellBase);

/* ================================================================== */
/*  Zestaw – wiersz cennika. Bez próbki (na zdjęciu sklepu jest pudełko);  */
/*  nazwa otwiera „Szczegóły” ze składem zestawu.                          */
/* ================================================================== */

function SetRowBase({ product, qty, onAdd, onDetails }) {
  const variant = product.variants[0];
  const titleId = `pig-${product.id}`;
  const canAdd = product.inStock && variant?.inStock;
  return (
    <article
      aria-labelledby={titleId}
      className="grid grid-cols-1 gap-y-3 border-t border-ink/15 py-4 sm:flex sm:items-center sm:gap-x-5"
    >
      {/* nazwa: na telefonie cała szerokość; sm–lg kurczy się do treści, a kropki
          prowadzą wzrok do ceny; od lg zajmuje wolne miejsce kolumny */}
      <div className="min-w-0 sm:shrink lg:flex-1">
        <p className="as-kicker">
          {collectionLabel(product.collection)}
          {DOT}
          {zonesText(product)}
        </p>
        {/* h4: zestawy stoją pod nagłówkiem „Zestawy” (h3) */}
        <h4 id={titleId} className="mt-1.5 text-[1.0625rem] leading-snug text-ink">
          {/* pole dotyku ≥ 44 px także przy nazwie w jednej linii (23 + 2 × 12 px) */}
          <button
            type="button"
            onClick={() => onDetails(product.id)}
            aria-haspopup="dialog"
            className="relative text-left underline decoration-ink/30 underline-offset-4 transition-colors before:absolute before:-inset-y-3 before:inset-x-0 before:content-[''] hover:decoration-ink"
          >
            {displayName(product.name)}
            <span className="sr-only"> – skład zestawu</span>
          </button>
        </h4>
        {qty > 0 && (
          <p className="mt-1.5 text-[0.8125rem] text-gold-deep">
            W zamówieniu: {qty}
            {NBSP}szt.
          </p>
        )}
      </div>
      <span
        aria-hidden="true"
        className="hidden min-w-[1.5rem] flex-1 translate-y-[-3px] self-center border-b border-dotted border-ink/20 sm:block lg:hidden"
      />
      <div className="flex items-center gap-x-4 sm:shrink-0 sm:gap-x-5">
        <PriceLine variants={product.variants} className="shrink-0" />
        <span
          aria-hidden="true"
          className="min-w-[1.5rem] flex-1 translate-y-[-3px] border-b border-dotted border-ink/20 sm:hidden"
        />
        {/* stała szerokość komórki akcji: kwoty w jednym pionie przy „Dodaj” i „Brak” */}
        <div className="flex w-[6.125rem] shrink-0 justify-end">
          {canAdd ? (
            <button
              type="button"
              onClick={() => onAdd(product.id, variant.label ?? null)}
              aria-label={`Dodaj do zamówienia: ${product.name}`}
              className={ADD_BTN}
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Dodaj
            </button>
          ) : (
            <p className="as-badge flex h-11 items-center text-right leading-snug">Brak w magazynie</p>
          )}
        </div>
      </div>
    </article>
  );
}

export const SetRow = memo(SetRowBase);
