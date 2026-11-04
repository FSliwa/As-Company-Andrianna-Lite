'use client';

/**
 * Karta odcienia i zestawu w katalogu /pigmenty (zestawy – od 4.11.2026 ta sama karta co odcień,
 * prośba Kariny: „powiększenia zdjęć zestawów … tak aby były bardziej widoczne”).
 *
 * Obie w React.memo: dostają stabilne `onAdd` / `onDetails` (useCallback)
 * i liczbę sztuk TEGO produktu w zamówieniu – zmiana listy renderuje
 * od nowa tylko komórkę, której dotyczy, a nie całą siatkę.
 * Komórka odcienia zaczyna się kwadratowym polem (prośba klientki: „brakuje zdjęć
 * buteleczek”): packshot butelki z /Graphics (src/lib/productPhotos.js), a bez
 * zdjęcia – w tym samym polu – próbka koloru poglądowego z danych (ProductTile
 * w parts.jsx). Pole ma wysokość z szerokości kolumny, więc rzędy są równe. Zdjęć ze
 * sklepu nie pokazujemy.
 *
 * Telefon (< sm): komórka odcienia bez opisu (pełny opis jest w „Szczegółach”),
 * więc sześć odcieni startowych zajmuje ~1 ekran mniej.
 */

import React, { memo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ArrowLink } from '@/components/as/Primitives';
import PresaleBadge from '@/components/magicui/PresaleBadge';
import { cn } from '@/lib/utils';
import { findVariant, formatCapacity } from '@/lib/pigments';
import {
  ADD_BTN,
  defaultLabel,
  displayName,
  kickerFor,
  NBSP,
  PriceLine,
  ProductTile,
  VariantPicker,
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
  return <p className={cn('as-badge flex h-11 items-center', className)}>Brak na stanie</p>;
}

/* ================================================================== */
/*  Odcień                                                             */
/* ================================================================== */

/* Szerokość pola w siatce katalogu (Pigments.jsx): 2 kolumny, od md 3, od xl 4;
   łam maks. 1440 px (od 1440 px kolumna ok. 308 px). */
const TILE_SIZES = '(min-width: 1440px) 310px, (min-width: 1280px) 22vw, (min-width: 768px) 29vw, 45vw';

/* `heading` – h4 dla kart zestawów (stoją pod nagłówkiem „Zestawy”, h3). */
function ProductCellBase({ product, qty, onAdd, onDetails, heading: Heading = 'h3' }) {
  const [label, setLabel] = useState(() => defaultLabel(product));
  const variant = findVariant(product, label);
  const multi = product.variants.length > 1;
  const canAdd = Boolean(product.inStock && variant?.inStock);
  const titleId = `pig-${product.id}`;
  const addName = [product.name, variant?.label ? formatCapacity(variant.label) : null].filter(Boolean).join(', ');

  return (
    <article aria-labelledby={titleId} className="flex h-full min-w-0 flex-col">
      {/* zdjęcie butelki albo (bez zdjęcia) próbka koloru – to samo pole; pole zastępuje
          dawną hairline .as-cell i pasek próbki pod nazwą (kolor jest już w polu) */}
      <ProductTile product={product} sizes={TILE_SIZES} />
      <p className="as-kicker mt-5">{kickerFor(product)}</p>
      {/* przedsprzedaż (lista Kariny z 14.10.2026, np. zestaw Pigmenty Supernatural) */}
      {product.presale && <PresaleBadge className="mt-3 w-fit">Sprzedaż przedpremierowa</PresaleBadge>}
      <Heading id={titleId} className="as-title as-text-balance mt-3 break-words text-ink">
        {displayName(product.name)}
      </Heading>

      {/* opis od sm; na telefonie pełny opis w „Szczegółach” */}
      {product.shortDesc && (
        <p className="mt-4 line-clamp-2 hidden text-[0.9375rem] leading-[1.6] text-ink/75 max-sm:text-[1rem] short:text-[1rem] sm:block">
          {product.shortDesc}
        </p>
      )}

      {/* akcje: [pojemność] [Dodaj] [Szczegóły] – zawijają się, gdy komórka jest wąska */}
      {/* blok akcji wyrównany do dołu komórki; „W zamówieniu” rośnie w górę,
          więc ceny i przyciski w rzędzie siatki zostają na jednej linii */}
      <div className="mt-auto pt-5">
        <InOrder qty={qty} />
        <PriceLine variants={product.variants} showStock={product.inStock && multi} stale={product.clientPrice ? false : undefined} />
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

