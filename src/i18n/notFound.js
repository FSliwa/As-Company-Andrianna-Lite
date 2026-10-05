/**
 * Wspólne elementy stron 404 w trzech gałęziach (src/app/(pl)|en|ru/not-found.jsx):
 * metadane w danym języku. noindex bez canonical, bez opisu i og:url strony głównej
 * (dawniej canonical na stronę główną: sprzeczny sygnał z noindex, a udostępniony zły link
 * pokazywał podgląd strony głównej) i bez hreflang – 404 nie ma wersji językowych.
 */
import common from '@/content/common';
import { pick } from './merge';

export function notFoundMetadata(locale) {
  return {
    title: pick(common, locale).notFound.metaTitle,
    robots: { index: false },
    description: null,
    alternates: { canonical: null, languages: null },
    openGraph: null,
    twitter: null,
  };
}
