import Certificates from '@/views/Certificates';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /certyfikaty (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'certificates',
  title: 'Product documentation',
  description:
    'What documents we provide for PMU products – declarations of conformity, safety data sheets and device documentation.',
});

export default function Page() {
  return <Certificates />;
}
