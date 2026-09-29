import Treatments from '@/views/Treatments';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Zabiegi makijażu permanentnego',
  description:
    'Super Natural Brows, Perfect Powder Brows, Perfect Lips i Perfect Eyeliners — cennik, korekty, odświeżenia i usuwanie. Warszawa.',
  alternates: { canonical: '/uslugi' },
};

export default function Page() {
  return <Treatments />;
}
