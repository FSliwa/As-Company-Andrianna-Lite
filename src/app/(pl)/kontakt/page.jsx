import Contact from '@/views/Contact';
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   Tytuł z miastem i rodzajem działalności (samo „Kontakt” – 28 znaków – nie mówiło wyszukiwarce, czego dotyczy). */
export const metadata = pageMeta({
  title: 'Kontakt – salon i akademia PMU w Warszawie',
  description:
    'Babushkina Academy, Warszawa – umów wizytę na makijaż permanentny albo zapytaj o termin szkolenia PMU.',
  path: '/kontakt',
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd({ path: '/kontakt', name: 'Kontakt' })} />
      <Contact />
    </>
  );
}
