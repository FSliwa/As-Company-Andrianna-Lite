import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_PUBLISHED } from '@/lib/legal';
import doc from '@/content/legal/privacy.pl.json';

/* Polityka prywatności – treść: src/content/legal/privacy.*.json, dane firmy z LEGAL (site.js).
   Dopóki dokumenty nie obowiązują (LEGAL_PUBLISHED: dane firmy + zatwierdzona treść), dokument jest projektem:
   pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'pl',
  route: 'privacy',
  title: doc.title,
  description: 'Zasady przetwarzania danych osobowych w serwisie AS COMPANY i Babushkina Academy: formularze, rezerwacja online, hosting, Twoje prawa.',
  noindex: !LEGAL_PUBLISHED,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="pl" />;
}
