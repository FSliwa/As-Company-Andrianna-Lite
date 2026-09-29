import Education from '@/views/Education';
import { JsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Szkolenia PMU – Super Natural Brows',
  description:
    'Szkolenie Super Natural Brows i kurs podstawowy makijażu permanentnego w Babushkina Academy: program, format, ceny netto i harmonogram.',
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
