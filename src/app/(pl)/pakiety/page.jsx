import Packages from '@/views/Packages';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Ścieżka zabiegowa',
  description:
    'Konsultacja, zabieg, korekta i odświeżenie — kolejność wizyt przy makijażu permanentnym i cena każdego kroku.',
  path: '/pakiety',
});

export default function Page() {
  return <Packages />;
}
