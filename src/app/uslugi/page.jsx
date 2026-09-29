import Treatments from '@/views/Treatments';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D2: nazwy technik wg briefu (Perfect Brows, Perfect Eyes — pigmentacja linii rzęs). */
export const metadata = pageMeta({
  title: 'Makijaż permanentny brwi i ust — zabiegi i cennik',
  description:
    'Super Natural Brows, Perfect Brows, Perfect Lips i Perfect Eyes (linia rzęs) w Warszawie: cennik, korekta, odświeżenie i usuwanie makijażu permanentnego.',
  path: '/uslugi',
});

export default function Page() {
  return <Treatments />;
}
