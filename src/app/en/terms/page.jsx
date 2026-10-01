import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_PUBLIC } from '@/lib/legal';
import doc from '@/content/legal/terms.en.json';

/* Regulamin serwisu (art. 8 u.ś.u.d.e.) i rezerwacja online – treść: src/content/legal/terms.*.json, dane firmy z LEGAL (site.js).
   Dokument jest publiczny (LEGAL_PUBLIC – decyzja Filipa z 30.09.2026): indeksowany i w sitemap także przed
   uzupełnieniem danych firmy (wtedy z marką, miastem i Instagramem); w pełni obowiązuje po uzupełnieniu danych
   i zatwierdzeniu treści (LEGAL_PUBLISHED). Tryb projektu z noindex wraca tylko przy LEGAL_PUBLIC = false. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'terms',
  title: doc.title,
  description: 'Terms of Use of the Babushkina Academy website: forms, pigment list, online booking, complaints.',
  noindex: !LEGAL_PUBLIC,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="en" />;
}
