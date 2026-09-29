import Treatments from '@/views/Treatments';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /uslugi (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'treatments',
  title: 'Permanent makeup for brows and lips — treatments and prices',
  description:
    'Super Natural Brows, Perfect Powder Brows, Perfect Lips and Perfect Eyeliners in Warsaw: prices, touch-ups, refreshes and permanent makeup removal.',
});

export default function Page() {
  return <Treatments />;
}
