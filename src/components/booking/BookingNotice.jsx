'use client';

/**
 * Klauzula informacyjna pod przyciskiem rezerwacji. Ten sam układ i warunek co FormNotice
 * z Primitives (renderuje się, gdy dokumenty prawne są publiczne – LEGAL_PUBLIC; zdanie
 * o administratorze z noticeController: do czasu uzupełnienia danych firmy marka, miasto
 * i Instagram),
 * ale z prawdziwym celem przetwarzania: rezerwacja wizyty zapisywana w Kalendarzu Google
 * salonu (Google jako podmiot przetwarzający) – ogólne „by odpowiedzieć na zapytanie” byłoby
 * tu nieprawdą. Do tego akceptacja Regulaminu przy przycisku (art. 8 u.ś.u.d.e., art. 384 KC)
 * i – gdy formularz chroni Cloudflare Turnstile – odesłanie do Polityki cookies.
 * Teksty z src/content/common (wspólne dla /umow-wizyte, /en/book i /ru/book), linki przez
 * LocaleLink – prowadzą do dokumentu w języku strony.
 */

import Link from '@/components/as/LocaleLink';
import common from '@/content/common';
import LegalText from '@/components/as/LegalText';
import { useContent, useLocale } from '@/i18n/client';
import { LEGAL_PUBLIC } from '@/lib/legal';
import { ROUTES } from '@/i18n/routes';
import { cn } from '@/lib/utils';

const LINK = 'underline underline-offset-2 hover:text-ink';

/** @param {{ submitLabel: string, turnstile?: boolean, className?: string }} props */
export function BookingNotice({ submitLabel, turnstile = false, className }) {
  const t = useContent(common);
  const locale = useLocale();
  if (!LEGAL_PUBLIC) return null;
  return (
    <p className={cn('text-[0.8125rem] leading-relaxed text-mocha', className)}>
      <LegalText text={t.noticeController} locale={locale} linkClassName={LINK} /> {t.bookingPurpose}{' '}
      {t.noticePrivacy.pre}
      <Link href={ROUTES.privacy} className={LINK}>
        {t.noticePrivacy.link}
      </Link>
      {t.noticePrivacy.post} {t.bookingTerms.pre.replace('{button}', submitLabel)}
      <Link href={`${ROUTES.terms}#rezerwacja-online`} className={LINK}>
        {t.bookingTerms.link}
      </Link>
      {t.bookingTerms.post}
      {turnstile && (
        <>
          {' '}
          {t.bookingTurnstile.pre}
          <Link href={`${ROUTES.cookies}#co-zapisujemy`} className={LINK}>
            {t.bookingTurnstile.link}
          </Link>
          {t.bookingTurnstile.post}
        </>
      )}{' '}
      {t.requiredLegend}
    </p>
  );
}
