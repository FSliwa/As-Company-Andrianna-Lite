import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_PUBLISHED } from '@/lib/legal';
import doc from '@/content/legal/privacy.en.json';

/* Polityka prywatności – treść: src/content/legal/privacy.*.json, dane firmy z LEGAL (site.js).
   Dopóki dokumenty nie obowiązują (LEGAL_PUBLISHED: dane firmy + zatwierdzona treść), dokument jest projektem:
   pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'privacy',
  title: doc.title,
  description: 'How personal data is processed on the AS COMPANY and Babushkina Academy website: forms, online booking, hosting and your rights.',
  noindex: !LEGAL_PUBLISHED,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="en" />;
}
