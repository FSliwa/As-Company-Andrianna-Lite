import Contact from '@/views/Contact';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /kontakt (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'contact',
  title: 'Контакты',
  description:
    'Babushkina Academy, Варшава — запишитесь на перманентный макияж или узнайте даты обучения ПМ.',
});

export default function Page() {
  return <Contact />;
}
