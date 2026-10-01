import Certificates from '@/views/Certificates';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /certyfikaty (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'en',
  route: 'certificates',
  title: 'Product documentation',
  description:
    'Documentation for the products we offer: REACH-compliant pigments and their safety data sheets.',
});

export default function Page() {
  return <Certificates />;
}
