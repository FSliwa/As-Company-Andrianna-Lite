import Machines from '@/views/Machines';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /maszynki (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'machines',
  title: 'AS HERO and AS PRINCESS PMU machines',
  description:
    'AS HERO and AS PRINCESS permanent makeup machines – models, specifications, purchase in the AS shop and rental for studios.',
});

export default function Page() {
  return <Machines />;
}
