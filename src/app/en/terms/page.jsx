import LegalDocument from '@/components/as/LegalDocument';
import { pageMeta } from '@/lib/seo';
import { LEGAL_PUBLISHED } from '@/lib/legal';
import doc from '@/content/legal/terms.en.json';

/* Regulamin serwisu (art. 8 u.ś.u.d.e.) i rezerwacja online – treść: src/content/legal/terms.*.json, dane firmy z LEGAL (site.js).
   Dopóki dokumenty nie obowiązują (LEGAL_PUBLISHED: dane firmy + zatwierdzona treść), dokument jest projektem:
   pas „Projekt dokumentu”, oznaczone braki, noindex. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'terms',
  title: doc.title,
  description: 'Terms of Use of the AS COMPANY and Babushkina Academy website: forms, pigment list, online booking, complaints.',
  noindex: !LEGAL_PUBLISHED,
});

export default function Page() {
  return <LegalDocument doc={doc} locale="en" />;
}
