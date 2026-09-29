import Machines from '@/views/Machines';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /maszynki (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'machines',
  title: 'Машинки для ПМ AS HERO и AS PRINCESS',
  description:
    'Машинки для перманентного макияжа AS HERO и AS PRINCESS — модели, характеристики, покупка в магазине AS и аренда для студий.',
});

export default function Page() {
  return <Machines />;
}
