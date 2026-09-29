import Contact from '@/views/Contact';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Kontakt',
  description:
    'Babushkina Academy, Warszawa — umów wizytę w salonie makijażu permanentnego albo zapytaj o termin szkolenia.',
  alternates: { canonical: '/kontakt' },
};

export default function Page() {
  return <Contact />;
}
