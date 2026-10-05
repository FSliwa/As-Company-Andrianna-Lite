import Education from '@/views/Education';
import { JsonLd, breadcrumbJsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D4: pięć kursów z briefu; bez „ceny netto” – netto podają tylko plakaty dwóch kursów. */
export const metadata = pageMeta({
  /* Fraza B2B z techniką i miastem (audyt SEO 5.10.2026: na /szkolenia nie było słowa „brwi”,
     a „Super Natural Brows” w wynikach przykrywa kosmetyk o tej samej nazwie). */
  title: 'Szkolenia z włosa maszynowego brwi w Warszawie',
  description:
    'Szkolenia z makijażu permanentnego brwi techniką włosa maszynowego Super Natural Brows w Warszawie – od podstaw, dla linergistek i Master Class. RIS i BUR.',
  path: '/szkolenia',
});

export default function Page() {
  return (
    <>
      <JsonLd data={coursesJsonLd()} />
      <JsonLd data={breadcrumbJsonLd({ path: '/szkolenia', name: 'Szkolenia' })} />
      <Education />
    </>
  );
}
