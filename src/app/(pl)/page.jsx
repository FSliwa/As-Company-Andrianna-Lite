import Home from '@/views/Home';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D2: „linia rzęs” zamiast „kresek”; D9: „AS COMPANY” zamiast wariantu bez źródła „AS PMU”. */
export const metadata = pageMeta({
  description:
    'Makijaż permanentny brwi, ust i linii rzęs w Warszawie oraz szkolenia Super Natural Brows w Babushkina Academy. Pigmenty i maszynki AS COMPANY.',
  path: '/',
});

export default function Page() {
  return <Home />;
}
