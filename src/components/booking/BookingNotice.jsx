'use client';

/**
 * Klauzula informacyjna pod przyciskiem rezerwacji. Ten sam układ i warunek co FormNotice
 * z Primitives (renderuje się dopiero po uzupełnieniu LEGAL), ale z prawdziwym celem
 * przetwarzania: rezerwacja wizyty zapisywana w Kalendarzu Google salonu (Google jako
 * podmiot przetwarzający) – ogólne „by odpowiedzieć na zapytanie” byłoby tu nieprawdą.
 */

import Link from 'next/link';
import { LEGAL } from '@/lib/site';
import { LEGAL_COMPLETE } from '@/lib/legal';
import { cn } from '@/lib/utils';

export function BookingNotice({ className }) {
  if (!LEGAL_COMPLETE) return null;
  return (
    <p className={cn('text-[0.8125rem] leading-relaxed text-mocha', className)}>
      Administratorem danych jest {LEGAL.company}. Dane z formularza przetwarzamy, by zarezerwować i obsłużyć
      Twoją wizytę; termin z danymi kontaktowymi zapisujemy w Kalendarzu Google salonu.{' '}
      <Link href="/polityka-prywatnosci" className="underline underline-offset-2 hover:text-ink">
        Polityka prywatności
      </Link>
      . Pola oznaczone * są wymagane.
    </p>
  );
}
