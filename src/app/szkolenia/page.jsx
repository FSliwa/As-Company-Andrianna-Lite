import Education from '@/views/Education';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'Szkolenia PMU — Babushkina Academy',
  description:
    'Szkolenie Super Natural Brows (14 dni online i 2 dni praktyki) oraz kurs podstawowy makijażu permanentnego. Dofinansowanie RIS, KFS i BUR.',
  alternates: { canonical: '/szkolenia' },
};

export default function Page() {
  return <Education />;
}
