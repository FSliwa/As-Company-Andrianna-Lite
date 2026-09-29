/**
 * Wspólne elementy stron 404 w trzech gałęziach (src/app/(pl)|en|ru/not-found.jsx):
 * metadane w danym języku. Canonical na stronę główną języka, bez hreflang
 * (nadpisuje `alternates` z root layoutu) — 404 nie ma wersji językowych.
 */
import common from '@/content/common';
import { pick } from './merge';
import { localePath } from './routes';

export function notFoundMetadata(locale) {
  return {
    title: pick(common, locale).notFound.metaTitle,
    robots: { index: false },
    alternates: { canonical: localePath('/', locale) },
  };
}
