import PrivacyPolicy from '@/components/as/PrivacyPolicy';
import { pageMeta } from '@/lib/seo';
import { LEGAL } from '@/lib/site';
import { notFoundMetadata } from '@/i18n/notFound';

/* Wersja angielska trasy /polityka-prywatnosci — 404, dopóki klient nie dostarczy treści
   (LEGAL.privacyPolicy w src/lib/site.js); widok: src/components/as/PrivacyPolicy.jsx. */
/* Bez treści trasa to 404 — metadane 404 (noindex, bez hreflang), nie tytuł dokumentu. */
export const metadata = !LEGAL.privacyPolicy
  ? notFoundMetadata('en')
  : pageMeta({
      locale: 'en',
      route: 'privacy',
      title: 'Privacy policy',
      description: 'How personal data is processed on the AS COMPANY LOVELINESS and Babushkina Academy website.',
    });

export default function Page() {
  return <PrivacyPolicy locale="en" />;
}
