import Packages from '@/views/Packages';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Ścieżka zabiegowa',
  description:
    'Od konsultacji przez zabieg i korektę po odświeżenie — kolejność wizyt i ceny każdego kroku.',
  alternates: { canonical: '/pakiety' },
};

export default function Page() {
  return <Packages />;
}
