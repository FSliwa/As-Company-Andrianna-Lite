'use client';

/**
 * Karta produktu sklepu (/sklep) – projekt „Babushkina Academy – Sklep redesign” w Figmie (2.11.2026,
 * prośba Filipa: „sekcje z produktami mają wyglądać profesjonalnie, a nie jak wklejone zdjęcia”).
 *
 * Jedna siatka kart zamiast wierszy cennika z miniaturami: kwadratowe pole zdjęcia w tonie cream-100
 * (packshot na białym tle w środku z oddechem i mix-blend-multiply – biel znika; zdjęcie lampy – na
 * całe pole), pod nim nazwa (otwiera „Szczegóły”), opis wariantów, cena i akcja w jednej linii na dole
 * karty (karty w rzędzie mają równe wysokości – cena i przyciski stoją w jednym pionie).
 * Akcja: „Dodaj” (jeden wariant), „Wybierz” (kilka wariantów – okno wyboru), „Zapytaj” (bez ceny).
 *
 * `split` – kategoria z jednym produktem: poniżej lg karta jako wiersz (zdjęcie 6,5 rem obok treści),
 * żeby jedna karta nie zostawiała pustej połowy siatki 2-kolumnowej; od lg – zwykła karta.
 */

import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import { ArrowLink } from '@/components/as/Primitives';
import PresaleBadge from '@/components/magicui/PresaleBadge';
import { cn } from '@/lib/utils';
import { formatCapacity, formatPrice, priceFromLabel } from '@/lib/pigments';
import { productPhoto } from '@/lib/productPhotos';
import { useContent, useLocale } from '@/i18n/client';
import { shopDict } from '@/content/views/shop';
import { ADD_BTN, DOT, ProductPhoto, displayName } from '@/components/pigments/parts';

const CARD_SIZES = '(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw';

/* Opis pod nazwą: osie wariantów (SATELLITE: „7 konfiguracji igły · 20 szt.”), etykiety wariantów
   (pędzel: „czarny · biały”) albo pojemność jedynego wariantu („33 ml”). */
function metaOf(product, locale, t) {
  if (product.axes?.length) {
    const [first, ...rest] = product.axes;
    const fixed = rest.filter((a) => a.values.length === 1).map((a) => formatCapacity(a.values[0], locale));
    return [t.cell.configs ? t.cell.configs(first.values.length) : null, ...fixed].filter(Boolean).join(DOT);
  }
  return product.variants
    .map((v) => v.label)
    .filter(Boolean)
    .map((l) => formatCapacity(l, locale))
    .join(DOT);
}

function ProductCardBase({ product, qty, onAdd, onDetails, split = false }) {
  const t = useContent(shopDict);
  const locale = useLocale();
  const variant = product.variants[0];
  const choose = product.variants.length > 1;
  const canAdd = Boolean(!choose && !product.onRequest && product.inStock && variant?.inStock);
  const hasPhoto = Boolean(productPhoto(product.id));
  const meta = metaOf(product, locale, t);
  const titleId = `karta-${product.id}`;
  const open = () => onDetails(product.id);

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'group flex h-full flex-col',
        split && 'max-lg:grid max-lg:grid-cols-[6.5rem_minmax(0,1fr)] max-lg:items-center max-lg:gap-x-4'
      )}
    >
      {/* pole zdjęcia – to samo działanie co nazwa (dla czytnika i klawiatury wystarczy nazwa) */}
      <button
        type="button"
        onClick={open}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-full overflow-hidden bg-cream-100"
      >
        {hasPhoto ? (
          <ProductPhoto
            product={product}
            ratio="1 / 1"
            sizes={split ? `(min-width: 1024px) 22vw, 104px` : CARD_SIZES}
            pad
            className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <span className="block aspect-square" />
        )}
        {product.presale && (
          <PresaleBadge className="absolute left-3 top-3 bg-cream-50/90 max-sm:hidden">{t.cell.presale}</PresaleBadge>
        )}
      </button>

      <div className={cn('flex flex-1 flex-col pt-4', split && 'max-lg:pt-0')}>
        {product.presale && <PresaleBadge className="mb-2 w-fit sm:hidden">{t.cell.presale}</PresaleBadge>}
        <h4 id={titleId} className="text-[0.9375rem] leading-snug text-ink sm:text-[1.0625rem]">
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="text-left decoration-ink/30 underline-offset-4 transition-colors hover:underline focus-visible:underline"
          >
            {displayName(product.name)}
            <span className="sr-only">: {t.cell.details}</span>
          </button>
        </h4>
        {meta && <p className="mt-1 text-[0.8125rem] leading-snug text-mocha">{meta}</p>}
        {qty > 0 && <p className="mt-1 text-[0.8125rem] text-gold-deep">{t.order.inOrder(qty)}</p>}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 pt-4 max-sm:flex-col max-sm:items-stretch">
          {product.onRequest ? (
            <p className="text-[0.875rem] text-mocha">{t.cell.priceOnRequest}</p>
          ) : (
            <p className="whitespace-nowrap font-display text-[1.375rem] leading-none text-ink sm:text-[1.5rem]">
              {choose ? priceFromLabel(product.variants) : formatPrice(variant?.price)}
            </p>
          )}
          {choose ? (
            <button
              type="button"
              onClick={open}
              aria-haspopup="dialog"
              aria-label={t.cell.chooseFor(product.name)}
              className={cn(ADD_BTN, 'max-sm:w-full')}
            >
              {t.cell.choose}
            </button>
          ) : canAdd ? (
            <button
              type="button"
              onClick={() => onAdd(product.id, variant.label ?? null)}
              aria-label={t.cell.addTo(product.name)}
              className={cn(ADD_BTN, 'max-sm:w-full')}
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              {t.cell.add}
            </button>
          ) : product.onRequest ? (
            <ArrowLink href="/kontakt?temat=produkty" className="w-fit">
              {t.cell.ask}
              <span className="sr-only">: {product.name}</span>
            </ArrowLink>
          ) : (
            <p className="as-badge flex h-11 items-center leading-snug">{t.cell.out}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
