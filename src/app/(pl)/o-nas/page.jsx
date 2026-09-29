import About from '@/views/About';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'O nas – Andriana Babushkina',
  description:
    'Andriana Babushkina – linergistka, trenerka i sędzia międzynarodowa, autorka techniki Super Natural Brows. Salon i Babushkina Academy w Warszawie.',
  path: '/o-nas',
});

export default function Page() {
  return <About />;
}
