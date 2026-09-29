import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_COMPLETE } from '@/lib/legal';
import doc from '@/content/legal/cookies.ru.json';

/* Polityka cookies (art. 399 Prawa komunikacji elektronicznej) – treść: src/content/legal/cookies.*.json, dane firmy z LEGAL (site.js).
   Dopóki LEGAL jest niepełne, dokument jest projektem: pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'cookies',
  title: doc.title,
  description: 'Какую информацию сайт AS COMPANY сохраняет в вашем браузере, зачем и как этим управлять.',
  noindex: !LEGAL_COMPLETE,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="ru" />;
}
