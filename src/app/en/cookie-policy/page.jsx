import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_COMPLETE } from '@/lib/legal';
import doc from '@/content/legal/cookies.en.json';

/* Polityka cookies (art. 399 Prawa komunikacji elektronicznej) — treść: src/content/legal/cookies.*.json, dane firmy z LEGAL (site.js).
   Dopóki LEGAL jest niepełne, dokument jest projektem: pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'cookies',
  title: doc.title,
  description: 'What the AS COMPANY website stores in your browser, why, and how you can manage it.',
  noindex: !LEGAL_COMPLETE,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="en" />;
}
