import Shop from '@/views/Shop';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /sklep. Wrapper serwerowy: metadata trasy; sam widok jest komponentem
   klienckim. Nazwy i opisy produktów – z danych sklepu (po polsku). */
export const metadata = pageMeta({
  locale: 'en',
  route: 'shop',
  title: 'Shop – PMU cartridges, accessories and treatment products',
  description:
    'Cartridges, pre-drawing pencils, treatment products and lamps, plus pigments and the AS PRINCESS machine. Prices and ordering by enquiry.',
});

export default function Page() {
  return <Shop />;
}
