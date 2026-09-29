'use client';

/**
 * next/link, który sam tłumaczy polską ścieżkę na adres bieżącego języka:
 * <Link href="/uslugi#cennik"> na /en/… prowadzi do /en/treatments#cennik.
 * W wersji polskiej href zostaje bez zmian. Prop `locale` wymusza język
 * (np. przełącznik języka).
 */

import { forwardRef } from 'react';
import NextLink from 'next/link';
import { localizeHref } from '@/i18n/routes';
import { useLocale } from '@/i18n/client';

const LocaleLink = forwardRef(function LocaleLink({ href, locale, ...rest }, ref) {
  const current = useLocale();
  const target = typeof href === 'string' ? localizeHref(href, locale || current) : href;
  return <NextLink ref={ref} href={target} {...rest} />;
});

export default LocaleLink;
