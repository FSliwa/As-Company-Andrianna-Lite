import Pigments from '@/views/Pigments';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Pigmenty PMU AS OPIUM i Light Minerals',
  description:
    'Linie pigmentów do makijażu permanentnego brwi, ust i kresek. Pełna oferta i ceny w sklepie AS; dokumentacja na prośbę.',
  path: '/pigmenty',
});

export default function Page() {
  return <Pigments />;
}
