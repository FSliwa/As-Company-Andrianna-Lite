import About from '@/views/About';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /o-nas (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'about',
  title: 'О нас — Andriana Babushkina',
  description:
    'Andriana Babushkina — мастер перманентного макияжа, международный тренер и судья, автор техники Super Natural Brows. Студия и Babushkina Academy в Варшаве.',
});

export default function Page() {
  return <About />;
}
