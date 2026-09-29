import Machines from '@/views/Machines';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Maszynki PMU AS HERO i AS PRINCESS',
  description:
    'Lekkie urządzenia do makijażu permanentnego ze stopu aluminium: 7 prędkości, zmienny skok, wymienne akumulatory. Sprzedaż i wynajem.',
  alternates: { canonical: '/maszynki' },
};

export default function Page() {
  return <Machines />;
}
