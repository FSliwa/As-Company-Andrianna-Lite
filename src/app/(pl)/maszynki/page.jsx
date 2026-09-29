import Machines from '@/views/Machines';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D9: bez wariantu nazwy „sklep AS”; strona nie linkuje do sklepu (zamówienie przez zapytanie). */
export const metadata = pageMeta({
  title: 'Maszynki PMU AS HERO i AS PRINCESS',
  description:
    'Maszynki do makijażu permanentnego AS HERO i AS PRINCESS – modele, parametry, ceny i wynajem dla salonów.',
  path: '/maszynki',
});

export default function Page() {
  return <Machines />;
}
