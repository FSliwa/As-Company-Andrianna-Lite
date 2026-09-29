import Home from '@/views/Home';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  description:
    'Makijaż permanentny brwi, ust i kresek w Warszawie oraz szkolenia Super Natural Brows w Babushkina Academy. Pigmenty i maszynki AS PMU.',
  path: '/',
});

export default function Page() {
  return <Home />;
}
