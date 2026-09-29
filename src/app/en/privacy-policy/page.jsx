import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_PUBLIC } from '@/lib/legal';
import doc from '@/content/legal/privacy.en.json';

/* Polityka prywatności – treść: src/content/legal/privacy.*.json, dane firmy z LEGAL (site.js).
   Dokument jest publiczny (LEGAL_PUBLIC – decyzja Filipa z 30.09.2026): indeksowany i w sitemap także przed
   uzupełnieniem danych firmy (wtedy z marką, miastem i Instagramem); w pełni obowiązuje po uzupełnieniu danych
   i zatwierdzeniu treści (LEGAL_PUBLISHED). Tryb projektu z noindex wraca tylko przy LEGAL_PUBLIC = false. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'privacy',
  title: doc.title,
  description: 'How personal data is processed on the AS COMPANY and Babushkina Academy website: forms, online booking, hosting and your rights.',
  noindex: !LEGAL_PUBLIC,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="en" />;
}
