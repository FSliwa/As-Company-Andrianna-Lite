import Education from '@/views/Education';
import { JsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D4: pięć kursów z briefu; bez „ceny netto” – netto podają tylko plakaty dwóch kursów. */
export const metadata = pageMeta({
  title: 'Szkolenia PMU – Super Natural Brows',
  description:
    'Kursy Babushkina Academy: Super Natural Brows dla linergistek, Basic od podstaw, Master Class SNB Expert, kurs online Perfect Lips i kurs szyty na miarę.',
  path: '/szkolenia',
});

export default function Page() {
  return (
    <>
      <JsonLd data={coursesJsonLd()} />
      <Education />
    </>
  );
}
