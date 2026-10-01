import Machines from '@/views/Machines';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /maszynki (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'machines',
  title: 'Машинка для ПМ AS PRINCESS',
  description:
    'Беспроводная машинка для перманентного макияжа AS PRINCESS – характеристики, цена и аренда для студий.',
});

export default function Page() {
  return <Machines />;
}
