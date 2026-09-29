import Contact from '@/views/Contact';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Kontakt',
  description:
    'Babushkina Academy, Warszawa – umów wizytę na makijaż permanentny albo zapytaj o termin szkolenia PMU.',
  path: '/kontakt',
});

export default function Page() {
  return <Contact />;
}
