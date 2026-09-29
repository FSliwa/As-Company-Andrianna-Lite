'use client';

/**
 * „Szczegóły” odcienia albo zestawu: pełny opis ze sklepu (czysty tekst),
 * strefy, pojemności z cenami (z datą cen), stan magazynowy i dodanie do
 * zamówienia. Potwierdzenie „Dodano…” stoi nad przyciskami – przy długim
 * opisie nie wypada poza dolną krawędź przewijanego panelu.
 * Jeden dialog na stronę (sterowany `productId`), nie jeden na komórkę.
 */

import React, { useRef, useState } from 'react';
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
import {
  Description,
  NBSP,
  PRICE_TBC,
  Swatch,
  VariantPicker,
  defaultLabel,
  kickerFor,
  usePricesStale,
  zonesText,
} from './parts';

const SYNCED = formatSyncedDate();

function Body({ product, onAdd, onClose, qty, onShowOrder }) {
  const [label, setLabel] = useState(() => defaultLabel(product));
  const [added, setAdded] = useState(false);
  const stale = usePricesStale();
  const statusRef = useRef(null);
  const variant = findVariant(product, label);
  const multi = product.variants.length > 1;
  const canAdd = Boolean(product.inStock && variant?.inStock);

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
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription>
          {product.zones.length > 1 ? 'Strefy' : 'Strefa'}: {zonesText(product)}
          {!multi && product.variants[0]?.label ? ` · ${formatCapacity(product.variants[0].label)}` : ''}
        </DialogDescription>
      </DialogHeader>

      {!product.isSet && (
        <div className="mt-6">
          <Swatch color={product.color} className="h-10 w-full" />
          <p className="as-caption mt-2 max-w-none">
            {product.color
              ? 'Odcień poglądowy – kolor na ekranie różni się od pigmentu.'
              : 'Bez próbki – tego odcienia nie da się wiarygodnie pokazać na ekranie.'}
          </p>
        </div>
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

      <DialogFooter>
        {canAdd && (
          <button type="button" onClick={handleAdd} className="as-btn-solid">
            Dodaj do zamówienia
          </button>
        )}
        <button type="button" onClick={onClose} className="as-btn-ghost">
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

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-sticky-hide
        onCloseAutoFocus={onCloseAutoFocus}
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
