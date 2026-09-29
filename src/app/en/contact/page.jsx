import Contact from '@/views/Contact';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /kontakt (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'contact',
  title: 'Contact',
  description:
    'Babushkina Academy, Warsaw – book a permanent makeup visit or ask about PMU training dates.',
});

export default function Page() {
  return <Contact />;
}
