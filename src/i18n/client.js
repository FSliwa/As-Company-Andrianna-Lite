'use client';

/**
 * Hooki języka dla komponentów klienckich. Język wynika z adresu
 * (/en/…, /ru/…, reszta = pl), więc nie potrzeba providera — działa też
 * przy renderze na serwerze i na stronie 404.
 */

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { parsePath, localizeHref } from './routes';
import { pick } from './merge';
import { getSite } from './site';
import { BOOKING_URL } from '@/lib/site';

export function useLocale() {
  return parsePath(usePathname() || '/').locale;
}

/** { locale, canonical } — canonical to polska ścieżka bieżącej strony (null dla 404). */
export function usePathInfo() {
  return parsePath(usePathname() || '/');
}

/** Słownik treści { pl, en, ru } → treść w bieżącym języku (brakujące pola po polsku). */
export function useContent(dict) {
  return pick(dict, useLocale());
}

/** Dane z site.js w bieżącym języku (ceny i linki bez zmian, teksty przetłumaczone). */
export function useSite() {
  return getSite(useLocale());
}

/** Funkcja: polska ścieżka → adres w bieżącym języku (dla router.push, window.location itp.). */
export function useLocalizeHref() {
  const locale = useLocale();
  return useCallback((href) => localizeHref(href, locale), [locale]);
}

/**
 * Cel przycisków „Umów wizytę” w bieżącym języku: przy włączonej rezerwacji online
 * trasa `book` (/umow-wizyte, /en/book, /ru/book), inaczej `contact` (/kontakt, /en/contact…).
 */
export function useBookingHref() {
  return localizeHref(BOOKING_URL, useLocale());
}
