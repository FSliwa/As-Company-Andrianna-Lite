/**
 * Tekst dokumentu prawnego ze znacznikami danych firmy ({company}, {email}, segmenty [[…]],
 * listy {{…}} – składnia w src/lib/legal.js) jako elementy React. Bez hooków i bez
 * 'use client' – używa go serwerowy LegalDocument i klienckie klauzule (FormNotice,
 * BookingNotice), więc strona dokumentu i klauzula pod formularzem mówią to samo.
 *
 * Przy LEGAL_PUBLIC braki danych nie są nigdy widoczne: segmenty bez danych znikają,
 * a nazwa firmy i siedziba mają wartości zastępcze (marka, miasto). Oznaczenie
 * „[do uzupełnienia: …]” zostaje wyłącznie w trybie projektu (LEGAL_PUBLIC = false).
 */

import LocaleLink from '@/components/as/LocaleLink';
import { localizeHref } from '@/i18n/routes';
import { SITE_URL } from '@/lib/site';
import { FIELD_LABELS, LEGAL_PUBLIC, displayValue, tokenize } from '@/lib/legal';
import { nbspShort } from '@/lib/utils';

const LINK = 'underline underline-offset-2 hover:text-ink';
const HOST = SITE_URL.replace(/^https?:\/\//, '');

/** Kawałki z tokenize() → elementy React. */
export function LegalParts({ parts, locale = 'pl', linkClassName = LINK }) {
  const labels = FIELD_LABELS[locale] || FIELD_LABELS.pl;
  return parts.map((part, i) => {
    /* nbspShort: jednoliterowe „i”, „w”, „z”, „a” nie zostają na końcu wiersza (jak w PageHero) */
    if (part.text !== undefined) return nbspShort(part.text);
    if (part.link) {
      const href = localizeHref(part.link, locale);
      return (
        <LocaleLink key={i} href={href} locale={locale} className={linkClassName}>
          {HOST}
          {href}
        </LocaleLink>
      );
    }
    if (part.missing) {
      // przy LEGAL_PUBLIC nie powinno się zdarzyć (pilnuje legal.test.js) – wtedy nic nie wypisujemy
      if (LEGAL_PUBLIC) return null;
      return (
        <mark key={i} className="bg-gold/15 px-1 text-ink">
          [{labels.missing}: {labels[part.field] || part.field}]
        </mark>
      );
    }
    const v = part.value;
    const text = displayValue(part);
    if (part.field === 'email' || part.field === 'privacyEmail') {
      return (
        <a key={i} href={`mailto:${v}`} className={linkClassName}>
          {text}
        </a>
      );
    }
    if (part.field === 'phone') {
      return (
        <a key={i} href={`tel:${String(v).replace(/\s/g, '')}`} className={linkClassName}>
          {text}
        </a>
      );
    }
    if (part.field === 'instagram') {
      return (
        <a key={i} href={v} target="_blank" rel="noreferrer noopener" className={linkClassName}>
          {text}
        </a>
      );
    }
    return text;
  });
}

export default function LegalText({ text, locale = 'pl', linkClassName = LINK }) {
  return <LegalParts parts={tokenize(text, { locale })} locale={locale} linkClassName={linkClassName} />;
}
