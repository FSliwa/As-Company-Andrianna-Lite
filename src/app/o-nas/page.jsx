import About from '@/views/About';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D7: role wg briefu (także prelegentka); trasa zawiera też salon i akademię. */
export const metadata = pageMeta({
  title: 'O nas — Andriana Babushkina',
  description:
    'Andriana Babushkina — linergistka, trenerka, prelegentka i sędzia międzynarodowa, autorka techniki Super Natural Brows. Salon i akademia PMU w Warszawie.',
  path: '/o-nas',
});

export default function Page() {
  return <About />;
}
