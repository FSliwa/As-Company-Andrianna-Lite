import Shop from '@/views/Shop';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /sklep. Wrapper serwerowy: metadata trasy; sam widok jest komponentem
   klienckim. Nazwy i opisy produktów – z danych sklepu (po polsku). */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'shop',
  title: 'Магазин – картриджи, аксессуары и средства для ПМ',
  description:
    'Картриджи, карандаши для эскиза, средства для процедур и лампы, а также пигменты и машинка AS PRINCESS. Цены и заказ по запросу.',
});

export default function Page() {
  return <Shop />;
}
