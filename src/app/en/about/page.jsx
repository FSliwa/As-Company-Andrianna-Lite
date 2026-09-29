import About from '@/views/About';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /o-nas (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'about',
  title: 'About us – Andriana Babushkina',
  description:
    'Andriana Babushkina – PMU artist, international trainer and judge, creator of the Super Natural Brows technique. Studio and Babushkina Academy in Warsaw.',
});

export default function Page() {
  return <About />;
}
