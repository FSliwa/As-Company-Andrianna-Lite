import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_COMPLETE } from '@/lib/legal';
import doc from '@/content/legal/privacy.ru.json';

/* Polityka prywatności — treść: src/content/legal/privacy.*.json, dane firmy z LEGAL (site.js).
   Dopóki LEGAL jest niepełne, dokument jest projektem: pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'privacy',
  title: doc.title,
  description: 'Как обрабатываются персональные данные на сайте AS COMPANY и Babushkina Academy: формы, онлайн-запись, хостинг, ваши права.',
  noindex: !LEGAL_COMPLETE,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="ru" />;
}
