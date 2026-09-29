import Treatments from '@/views/Treatments';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /uslugi (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'treatments',
  title: 'Перманентный макияж бровей и губ – процедуры и цены',
  description:
    'Super Natural Brows, Perfect Brows, Perfect Lips и Perfect Eyes (межресничная линия) в Варшаве: цены, коррекции, обновления и удаление перманентного макияжа.',
});

export default function Page() {
  return <Treatments />;
}
