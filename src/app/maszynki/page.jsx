import Machines from '@/views/Machines';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Maszynki PMU AS HERO i AS PRINCESS',
  description:
    'Maszynki do makijażu permanentnego AS HERO i AS PRINCESS — modele, parametry, zakup w sklepie AS i wynajem dla salonów.',
  path: '/maszynki',
});

export default function Page() {
  return <Machines />;
}
