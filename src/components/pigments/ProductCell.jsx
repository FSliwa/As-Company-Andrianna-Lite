'use client';

/**
 * Komórka odcienia i wiersz zestawu w katalogu /pigmenty.
 *
 * Obie w React.memo: dostają stabilne `onAdd` / `onDetails` (useCallback)
 * i liczbę sztuk TEGO produktu w zamówieniu – zmiana listy renderuje
 * od nowa tylko komórkę, której dotyczy, a nie całą siatkę.
 * Bez zdjęć ze sklepu: kolor to odcień poglądowy z danych (pasek 8 px).
 */

import React, { memo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ArrowLink } from '@/components/as/Primitives';
import { cn } from '@/lib/utils';
import { collectionLabel, findVariant, formatCapacity } from '@/lib/pigments';
import { ADD_BTN, NBSP, PriceLine, Swatch, VariantPicker, defaultLabel, kickerFor, zonesText } from './parts';

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
        {product.name}
      </h3>

      {/* próbka: pasek 8 px pod nazwą; bez koloru – kreskowanie i podpis */}
      <div className="mt-4 flex items-center gap-3">
        <Swatch color={product.color} className="h-2 flex-1" />
        {!product.color && <span className="as-label shrink-0 text-ink/65">bez próbki</span>}
      </div>

      {product.shortDesc && (
        <p className="mt-4 line-clamp-2 text-[0.9375rem] leading-[1.6] text-ink/75">{product.shortDesc}</p>
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
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 border-t border-ink/15 py-4 sm:gap-x-8"
    >
      <div className="min-w-0">
        <p className="as-kicker">
          {collectionLabel(product.collection)} · {zonesText(product)}
        </p>
        {/* h4: zestawy stoją pod nagłówkiem „Zestawy” (h3) */}
        <h4 id={titleId} className="mt-1.5 text-[1.0625rem] leading-snug text-ink">
          <button
            type="button"
            onClick={() => onDetails(product.id)}
            aria-haspopup="dialog"
            className="relative text-left underline decoration-ink/30 underline-offset-4 transition-colors before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[''] hover:decoration-ink"
          >
            {product.name}
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
      <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
        <PriceLine variants={product.variants} />
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
          <p className="as-badge flex h-11 max-w-[7rem] items-center text-right leading-snug sm:max-w-none">
            Brak w magazynie
          </p>
        )}
      </div>
    </article>
  );
}

export const SetRow = memo(SetRowBase);
