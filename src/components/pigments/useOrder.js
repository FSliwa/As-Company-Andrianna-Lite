'use client';

/**
 * Lista „Twoje zamówienie” – stan w React, kopia w localStorage.
 *
 * Pozycja: { productId (slug ze sklepu), label (pojemność albo null), qty }.
 * Kopia w localStorage (klucz ORDER_KEY) jest tylko wygodą: każdy odczyt
 * i zapis jest w try/catch, więc przy zablokowanym storage (tryb prywatny,
 * podgląd, polityka przeglądarki) lista działa do przeładowania strony.
 * Dane kontaktowe z formularza NIE trafiają do storage – tylko produkty.
 *
 * Odczyt dopiero po zamontowaniu (useEffect), więc HTML z serwera i pierwszy
 * render w przeglądarce są identyczne (bez błędu hydratacji). Zapis rusza
 * dopiero po odczycie – pusta lista startowa nie nadpisuje zapisanej.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { findVariant, orderSummary, productById } from '@/lib/pigments';

export const ORDER_KEY = 'as-order-v1';
export const QTY_MIN = 1;
export const QTY_MAX = 50;

const clampQty = (n) => Math.min(QTY_MAX, Math.max(QTY_MIN, Math.floor(Number(n)) || QTY_MIN));
const same = (a, productId, label) => a.productId === productId && (a.label ?? null) === (label ?? null);

/** Odrzuca pozycje spoza katalogu, łączy duplikaty, pilnuje zakresu ilości. */
export function sanitizeOrder(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const product = productById(e.productId);
    const variant = product ? findVariant(product, e.label ?? null) : null;
    if (!product || !variant) continue;
    const label = variant.label ?? null;
    const prev = out.find((x) => same(x, product.id, label));
    if (prev) prev.qty = clampQty(prev.qty + clampQty(e.qty));
    else out.push({ productId: product.id, label, qty: clampQty(e.qty) });
  }
  return out;
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    return raw ? sanitizeOrder(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  try {
    if (items.length) window.localStorage.setItem(ORDER_KEY, JSON.stringify(items));
    else window.localStorage.removeItem(ORDER_KEY);
  } catch {
    /* brak storage – lista żyje tylko w pamięci strony */
  }
}

export function useOrder() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
    /* druga karta z tą samą stroną – ta sama lista */
    const onStorage = (e) => {
      if (e.key !== ORDER_KEY) return;
      try {
        setItems(e.newValue ? sanitizeOrder(JSON.parse(e.newValue)) : []);
      } catch {
        /* uszkodzony wpis – zostaw bieżącą listę */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (ready) writeStorage(items);
  }, [items, ready]);

  /* Funkcje stabilne (bez zależności) – komórki katalogu w React.memo
     nie renderują się od nowa przy każdej zmianie listy. */
  const add = useCallback((productId, label = null, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => same(x, productId, label));
      if (i === -1) return sanitizeOrder([...prev, { productId, label, qty }]);
      const next = prev.slice();
      next[i] = { ...next[i], qty: clampQty(next[i].qty + qty) };
      return next;
    });
  }, []);

  const setQty = useCallback((productId, label, qty) => {
    setItems((prev) => prev.map((x) => (same(x, productId, label) ? { ...x, qty: clampQty(qty) } : x)));
  }, []);

  const remove = useCallback((productId, label) => {
    setItems((prev) => prev.filter((x) => !same(x, productId, label)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const summary = useMemo(() => orderSummary(items), [items]);

  /** Łączna liczba sztuk danego produktu (wszystkie pojemności) – do komórek katalogu. */
  const qtyByProduct = useMemo(() => {
    const map = new Map();
    for (const x of items) map.set(x.productId, (map.get(x.productId) || 0) + x.qty);
    return map;
  }, [items]);

  return { items, ready, summary, qtyByProduct, add, setQty, remove, clear };
}
