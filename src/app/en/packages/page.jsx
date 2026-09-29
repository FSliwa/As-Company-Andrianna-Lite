import Packages from '@/views/Packages';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /pakiety (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'packages',
  title: 'Treatment journey',
  description:
    'Consultation, treatment, touch-up and refresh – the order of visits for permanent makeup and the price of each step.',
});

export default function Page() {
  return <Packages />;
}
