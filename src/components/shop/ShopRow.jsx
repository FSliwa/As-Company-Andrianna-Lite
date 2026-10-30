'use client';

/**
 * Wiersz produktu sklepu (/sklep) – układ cennika, jak wiersz zestawu na /pigmenty (SetRow):
 * nazwa otwiera „Szczegóły” (większe zdjęcie z lupą), po prawej cena i „Dodaj”. Produkt bez ceny
 * od klientki – „cena na zapytanie” i link do zapytania zamiast „Dodaj” (nie trafia na listę
 * zamówienia, bo nie ma kwoty). Przedsprzedaż – etykieta „Sprzedaż przedpremierowa” (PresaleBadge,
 * Magic UI). Miniatura po lewej – packshot z /Graphics; w kategorii, w której część produktów nie ma
 * zdjęcia, ich komórka zostaje pusta (bez zastępczych obrazów), więc nazwy trzymają pion.
 *
 * Telefon: nazwa na całą szerokość, pod nią cena i akcja; od md – w jednym rzędzie.
 */

import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import { ArrowLink } from '@/components/as/Primitives';
import PresaleBadge from '@/components/magicui/PresaleBadge';
import { cn } from '@/lib/utils';
import { formatCapacity, priceFromLabel } from '@/lib/pigments';
import { productPhoto } from '@/lib/productPhotos';
import { useContent, useLocale } from '@/i18n/client';
import { shopDict } from '@/content/views/shop';
import { ADD_BTN, PriceLine, ProductPhoto, displayName } from '@/components/pigments/parts';

/* Miniatura: 72 px na telefonie, 88 px od sm (klientka 26.10: „mało obrazków”). */
const THUMB_SIZES = '(min-width: 640px) 88px, 72px';

function ShopRowBase({ product, qty, onAdd, onDetails, thumbs = false }) {
  const t = useContent(shopDict);
  const locale = useLocale();
  const variant = product.variants[0];
  /* kilka wariantów (SATELLITE) – wybór w oknie „Szczegóły”, w wierszu cena „od …” */
  const choose = product.variants.length > 1;
  const canAdd = Boolean(!choose && !product.onRequest && product.inStock && variant?.inStock);
  const hasPhoto = Boolean(productPhoto(product.id));
  const titleId = `shop-${product.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'grid gap-x-4 border-t border-ink/15 py-4 sm:gap-x-5',
        thumbs ? 'grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5.5rem_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)]'
      )}
    >
      {thumbs && (hasPhoto ? <ProductPhoto product={product} sizes={THUMB_SIZES} className="self-start" /> : <span aria-hidden="true" />)}
      <div className="grid gap-y-3 md:flex md:items-center md:gap-x-6">
        <div className="min-w-0 md:flex-1">
          {product.presale && <PresaleBadge className="mb-2">{t.cell.presale}</PresaleBadge>}
          <h4 id={titleId} className="text-[1.0625rem] leading-snug text-ink">
            {/* pole dotyku ≥ 44 px także przy nazwie w jednej linii (23 + 2 × 12 px) */}
            <button
              type="button"
              onClick={() => onDetails(product.id)}
              aria-haspopup="dialog"
              className="relative text-left underline decoration-ink/30 underline-offset-4 transition-colors before:absolute before:-inset-y-3 before:inset-x-0 before:content-[''] hover:decoration-ink"
            >
              {displayName(product.name)}
              <span className="sr-only">: {t.cell.details}</span>
            </button>
          </h4>
          {product.shortDesc && (
            <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-[1.6] text-ink/75 max-sm:text-[1rem]">{product.shortDesc}</p>
          )}
          {qty > 0 && <p className="mt-1.5 text-[0.8125rem] text-gold-deep">{t.order.inOrder(qty)}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 md:shrink-0 md:flex-nowrap md:justify-end">
          {product.onRequest ? (
            <p className="whitespace-nowrap text-[0.9375rem] text-mocha">
              {variant?.label && <span className="mr-1.5 text-[0.8125rem]">{formatCapacity(variant.label, locale)}</span>}
              {t.cell.priceOnRequest}
            </p>
          ) : (
            choose ? (
              <p className="whitespace-nowrap font-display text-[1.375rem] leading-none text-ink">{priceFromLabel(product.variants)}</p>
            ) : (
              <PriceLine variants={product.variants} className="shrink-0" />
            )
          )}
          {/* stała szerokość komórki akcji: kwoty w jednym pionie przy „Dodaj” i „Zapytaj” */}
          <div className="flex w-[6.125rem] shrink-0 md:justify-end">
            {choose ? (
              <button
                type="button"
                onClick={() => onDetails(product.id)}
                aria-haspopup="dialog"
                aria-label={`Wybierz wariant: ${product.name}`}
                className={ADD_BTN}
              >
                Wybierz
              </button>
            ) : canAdd ? (
              <button
                type="button"
                onClick={() => onAdd(product.id, variant.label ?? null)}
                aria-label={t.cell.addTo(product.name)}
                className={ADD_BTN}
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
      </div>
    </article>
  );
}

export const ShopRow = memo(ShopRowBase);
