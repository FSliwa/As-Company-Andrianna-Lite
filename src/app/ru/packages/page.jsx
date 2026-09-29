import Packages from '@/views/Packages';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /pakiety (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'packages',
  title: 'Этапы процедуры',
  description:
    'Консультация, процедура, коррекция и обновление — порядок визитов при перманентном макияже и цена каждого этапа.',
});

export default function Page() {
  return <Packages />;
}
