import Treatments from '@/views/Treatments';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Makijaż permanentny brwi i ust — zabiegi i cennik',
  description:
    'Super Natural Brows, Perfect Powder Brows, Perfect Lips i Perfect Eyeliners w Warszawie: cennik, korekty, odświeżenia i usuwanie makijażu permanentnego.',
  path: '/uslugi',
});

export default function Page() {
  return <Treatments />;
}
