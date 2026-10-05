'use client';

/**
 * „Szczegóły” odcienia albo zestawu: zdjęcie butelki (packshot z /Graphics, większe
 * niż w komórce katalogu; bez zdjęcia – pasek próbki koloru), pełny opis ze sklepu
 * (czysty tekst), strefy, pojemności z cenami (z datą cen), stan magazynowy i dodanie do
 * zamówienia. Potwierdzenie „Dodano…” stoi nad przyciskami – przy długim
 * opisie nie wypada poza dolną krawędź przewijanego panelu.
 * Jeden dialog na stronę (sterowany `productId`), nie jeden na komórkę.
 *
 * Stopka (DialogFooter) jest bezpośrednim dzieckiem DialogContent, więc
 * przykleja się do dołu panelu – „Dodaj” jest zawsze w kadrze. Wybór pojemności
 * stoi pod opisem, dlatego przycisk mówi, co doda („Dodaj · 6 ml”). Telefon:
 * w stopce tylko przycisk główny (para w dwóch rzędach zabierała ~150 px
 * arkusza); „Wróć do katalogu” – link na końcu treści, a zamyka też ×.
 */

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLink } from '@/components/as/Primitives';
import { findVariant, formatCapacity, formatPrice, formatSyncedDate, productById } from '@/lib/pigments';
import { productPhoto } from '@/lib/productPhotos';
import {
  DOT,
  Description,
  NBSP,
  PRICE_TBC,
  ProductPhoto,
  Swatch,
  VariantPicker,
  defaultLabel,
  displayName,
  kickerFor,
  usePricesStale,
  zonesText,
} from './parts';

const SYNCED = formatSyncedDate();

/* Pole zdjęcia: 4:3 na szerokość treści panelu (od sm 560 px minus 2 × 40 px; telefon – arkusz
   na całą szerokość minus 2 × 20 px). Niski ekran (short:, telefon w poziomie): panel ma ok.
   350 px, z czego stopka z dwoma przyciskami zabiera ok. 150 – kadr 4:3 (ok. 360 px) zasłaniał
   cały widoczny obszar, a opis i ceny były dopiero za nim. Tam pole ma stałe 9 rem wysokości
   (aspect-auto zdejmuje proporcję z Figure), packshot stoi w nim pośrodku (object-contain). */
const PHOTO_FIELD = 'short:[&_.as-media]:!aspect-auto short:[&_.as-media]:h-36';
const PHOTO_SIZES = '(max-width: 1023px) and (max-height: 500px) 170px, (min-width: 640px) 480px, calc(100vw - 2.5rem)';

/* Na zdjęciach: odcień – butelka z opakowaniem; zestaw – pudełko i butelki. */
const photoAlt = (product) =>
  product.isSet ? `${product.name} – opakowanie i butelki zestawu` : `${product.name} – butelka i opakowanie`;

function Body({ product, onAdd, onClose, qty, onShowOrder }) {
  const [label, setLabel] = useState(() => defaultLabel(product));
  const [added, setAdded] = useState(false);
  const stale = usePricesStale();
  const statusRef = useRef(null);
  const variant = findVariant(product, label);
  const multi = product.variants.length > 1;
  const canAdd = Boolean(product.inStock && variant?.inStock);
  const hasPhoto = Boolean(productPhoto(product.id));
  /* pojemność w przycisku tylko przy wyborze (kilka butelek) – wybór stoi wyżej w treści */
  const capLabel = multi && variant?.label ? formatCapacity(variant.label) : null;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(product.id, variant.label ?? null);
    setAdded(true);
    /* potwierdzenie w kadrze panelu (przewijany przy długim opisie) */
    requestAnimationFrame(() => statusRef.current?.scrollIntoView({ block: 'nearest' }));
  };

  return (
    <>
      <DialogHeader>
        <p className="as-kicker">{kickerFor(product)}</p>
        <DialogTitle>{displayName(product.name)}</DialogTitle>
        <DialogDescription>
          {product.zones.length > 1 ? 'Strefy' : 'Strefa'}: {zonesText(product)}
          {!multi && product.variants[0]?.label ? `${DOT}${formatCapacity(product.variants[0].label)}` : ''}
        </DialogDescription>
      </DialogHeader>

      {/* zdjęcie (4:3, na niskim ekranie niższe pole – PHOTO_FIELD; packshot w środku, białe
          tło znika w kremie) albo, bez zdjęcia, pasek próbki jak dotąd – pusty duży kadr
          tylko wydłużałby panel */}
      {hasPhoto ? (
        <div className="mt-6">
          <ProductPhoto
            product={product}
            ratio="4 / 3"
            sizes={PHOTO_SIZES}
            alt={photoAlt(product)}
            className={PHOTO_FIELD}
          />
          <p className="as-caption mt-2 max-w-none">Kolor na zdjęciu i na ekranie może różnić się od pigmentu.</p>
        </div>
      ) : (
        !product.isSet && (
          <div className="mt-6">
            <Swatch color={product.color} className="h-10 w-full" />
            <p className="as-caption mt-2 max-w-none">
              {product.color
                ? 'Odcień poglądowy – kolor na ekranie różni się od pigmentu.'
                : 'Bez próbki – tego odcienia nie da się wiarygodnie pokazać na ekranie.'}
            </p>
          </div>
        )
      )}

      <Description text={product.description || product.shortDesc} className="mt-6" />

      <div className="mt-8 border-t border-ink/15 pt-6">
        {multi && product.inStock ? (
          <VariantPicker
            product={product}
            value={label}
            onChange={(l) => {
              setLabel(l);
              setAdded(false);
            }}
            name={`dlg-cap-${product.id}`}
            showPrice
          />
        ) : (
          <p className="text-ink">
            {variant?.label && (
              <span className="mr-2 text-[0.8125rem] text-mocha">{formatCapacity(variant.label)}</span>
            )}
            {stale ? (
              <span className="text-[0.9375rem] text-mocha">{PRICE_TBC}</span>
            ) : (
              <span className="font-display text-[1.375rem]">{formatPrice(variant?.price)}</span>
            )}
          </p>
        )}
        <p className="as-caption mt-3 max-w-none">
          {stale
            ? `Ceny z ${SYNCED} mogą być nieaktualne – potwierdzimy je w odpowiedzi na zapytanie.`
            : `Cena z ${SYNCED}.`}
        </p>
        {!product.inStock && <p className="as-badge mt-3">Brak w magazynie</p>}
      </div>

      {/* region stały (czytnik ogłasza zmianę), pusty nie zajmuje miejsca */}
      <div ref={statusRef} role="status" aria-live="polite" className={added ? 'mt-6 scroll-mb-24' : undefined}>
        {added && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[0.9375rem] text-ink">
              Dodano{variant?.label ? ` ${formatCapacity(variant.label)}` : ''}. W{NBSP}zamówieniu: {qty}
              {NBSP}szt.
            </p>
            <ArrowLink onClick={onShowOrder} className="w-fit">
              Twoje zamówienie
            </ArrowLink>
          </div>
        )}
      </div>

      {/* telefon: powrót jako link na końcu treści (w stopce zostaje sam przycisk główny) */}
      {canAdd && (
        <ArrowLink onClick={onClose} className="mt-8 w-fit sm:hidden">
          Wróć do katalogu
        </ArrowLink>
      )}

      {/* od sm oba przyciski z węższym px-6 mieszczą się w jednym rzędzie (457 px przy 478 px
          miejsca) – inaczej stopka w telefonie w poziomie zajmowała ok. 40% wysokości dialogu */}
      <DialogFooter>
        {canAdd && (
          <button type="button" onClick={handleAdd} className="as-btn-solid sm:px-6">
            {/* jeden element w przycisku (inline-flex z gap) – tekst bez dodatkowych odstępów */}
            <span>
              <span className="sm:hidden">Dodaj</span>
              <span className="hidden sm:inline">Dodaj do zamówienia</span>
              {capLabel && ` · ${capLabel}`}
            </span>
          </button>
        )}
        <button type="button" onClick={onClose} className={cn('as-btn-ghost sm:px-6', canAdd && 'max-sm:hidden')}>
          {canAdd ? 'Wróć do katalogu' : 'Zamknij'}
        </button>
      </DialogFooter>
    </>
  );
}

export default function ProductDialog({ productId, onClose, onAdd, qtyByProduct, onShowOrder, onCloseAutoFocus }) {
  const product = productId ? productById(productId) : null;
  /* Przy zamykaniu (animacja wyjścia) panel pokazuje jeszcze ostatni produkt. */
  const last = useRef(null);
  if (product) last.current = product;
  const shown = product || last.current;
  const contentRef = useRef(null);

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={contentRef}
        data-sticky-hide
        onCloseAutoFocus={onCloseAutoFocus}
        /* fokus na panelu (tytuł produktu czytany pierwszy), nie na radiu pojemności poza kadrem */
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          contentRef.current?.focus();
        }}
      >
        {shown && (
          <Body
            key={shown.id}
            product={shown}
            onAdd={onAdd}
            onClose={onClose}
            qty={qtyByProduct.get(shown.id) || 0}
            onShowOrder={onShowOrder}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
