import Education from '@/views/Education';
import { JsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /szkolenia (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'training',
  title: 'PMU training — Super Natural Brows',
  description:
    'Super Natural Brows training and the foundation course in permanent makeup at Babushkina Academy: programme, format, net prices and schedule.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={coursesJsonLd('en')} />
      <Education />
    </>
  );
}
