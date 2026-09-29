import Pigments from '@/views/Pigments';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Pigmenty AS OPIUM i Light Minerals',
  description:
    'Pigmenty do ust, brwi i powiek oraz linia medyczna. Dokumentacja REACH i karty charakterystyki dostępne na życzenie.',
  alternates: { canonical: '/pigmenty' },
};

export default function Page() {
  return <Pigments />;
}
