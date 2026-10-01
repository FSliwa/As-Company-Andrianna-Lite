import Machines from '@/views/Machines';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   Tylko AS PRINCESS (klientka sprzedaje tylko tę maszynkę, 30.09.2026); strona nie linkuje
   do sklepu (zamówienie przez zapytanie). */
export const metadata = pageMeta({
  title: 'Maszynka PMU AS PRINCESS',
  description:
    'Bezprzewodowa maszynka do makijażu permanentnego AS PRINCESS – parametry, cena i wynajem dla salonów.',
  path: '/maszynki',
});

export default function Page() {
  return <Machines />;
}
