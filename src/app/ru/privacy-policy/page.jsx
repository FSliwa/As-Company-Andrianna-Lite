import PrivacyPolicy from '@/components/as/PrivacyPolicy';
import { pageMeta } from '@/lib/seo';
import { LEGAL } from '@/lib/site';
import { notFoundMetadata } from '@/i18n/notFound';

/* Wersja rosyjska trasy /polityka-prywatnosci — 404, dopóki klient nie dostarczy treści
   (LEGAL.privacyPolicy w src/lib/site.js); widok: src/components/as/PrivacyPolicy.jsx. */
/* Bez treści trasa to 404 — metadane 404 (noindex, bez hreflang), nie tytuł dokumentu. */
export const metadata = !LEGAL.privacyPolicy
  ? notFoundMetadata('ru')
  : pageMeta({
      locale: 'ru',
      route: 'privacy',
      title: 'Политика конфиденциальности',
      description: 'Правила обработки персональных данных на сайте AS COMPANY LOVELINESS и Babushkina Academy.',
    });

export default function Page() {
  return <PrivacyPolicy locale="ru" />;
}
