import Certificates from '@/views/Certificates';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Dokumentacja i certyfikaty',
  description:
    'Deklaracje zgodności REACH, karty charakterystyki, sterylność kartridży i dokumentacja urządzeń — co dołączamy do każdego zamówienia.',
  alternates: { canonical: '/certyfikaty' },
};

export default function Page() {
  return <Certificates />;
}
