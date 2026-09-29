import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_COMPLETE } from '@/lib/legal';
import doc from '@/content/legal/terms.ru.json';

/* Regulamin serwisu (art. 8 u.ś.u.d.e.) i rezerwacja online — treść: src/content/legal/terms.*.json, dane firmy z LEGAL (site.js).
   Dopóki LEGAL jest niepełne, dokument jest projektem: pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'terms',
  title: doc.title,
  description: 'Условия пользования сайтом AS COMPANY и Babushkina Academy: формы, список пигментов, онлайн-запись, жалобы.',
  noindex: !LEGAL_COMPLETE,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="ru" />;
}
