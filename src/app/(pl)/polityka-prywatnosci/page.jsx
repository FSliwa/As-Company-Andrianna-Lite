import PrivacyPolicy from '@/components/as/PrivacyPolicy';
import { pageMeta } from '@/lib/seo';
import { LEGAL } from '@/lib/site';
import { notFoundMetadata } from '@/i18n/notFound';

/*
 * Polityka prywatności — treść dostarcza i zatwierdza klient (LEGAL.privacyPolicy
 * w src/lib/site.js: [{ heading, body }]). Dopóki jej nie ma, trasa zwraca 404,
 * stopka nie pokazuje linku, a sitemap jej nie zawiera — nie publikujemy szablonu.
 * Widok wspólny z /en/privacy-policy i /ru/privacy-policy: src/components/as/PrivacyPolicy.jsx.
 */
/* Bez treści trasa to 404 — metadane 404 (noindex, bez hreflang), nie tytuł dokumentu. */
export const metadata = !LEGAL.privacyPolicy
  ? notFoundMetadata('pl')
  : pageMeta({
      title: 'Polityka prywatności',
      description: 'Zasady przetwarzania danych osobowych w serwisie AS COMPANY LOVELINESS i Babushkina Academy.',
      path: '/polityka-prywatnosci',
    });

export default function Page() {
  return <PrivacyPolicy locale="pl" />;
}
