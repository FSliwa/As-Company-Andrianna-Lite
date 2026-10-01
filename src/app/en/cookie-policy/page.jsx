import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_PUBLIC } from '@/lib/legal';
import doc from '@/content/legal/cookies.en.json';

/* Polityka cookies (art. 399 Prawa komunikacji elektronicznej) – treść: src/content/legal/cookies.*.json, dane firmy z LEGAL (site.js).
   Dokument jest publiczny (LEGAL_PUBLIC – decyzja Filipa z 30.09.2026): indeksowany i w sitemap także przed
   uzupełnieniem danych firmy (wtedy z marką, miastem i Instagramem); w pełni obowiązuje po uzupełnieniu danych
   i zatwierdzeniu treści (LEGAL_PUBLISHED). Tryb projektu z noindex wraca tylko przy LEGAL_PUBLIC = false. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'cookies',
  title: doc.title,
  description: 'What the Babushkina Academy website stores in your browser, why, and how you can manage it.',
  noindex: !LEGAL_PUBLIC,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="en" />;
}
