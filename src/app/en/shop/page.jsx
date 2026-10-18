import Shop from '@/views/Shop';
import { pageMeta } from '@/lib/seo';
import { shopPricesExpired } from '@/lib/shop';

/* Wersja angielska trasy /sklep. Wrapper serwerowy: metadata trasy; sam widok jest komponentem
   klienckim. Nazwy i opisy produktów – z danych sklepu (po polsku). */
export const metadata = pageMeta({
  locale: 'en',
  route: 'shop',
  title: 'Shop – PMU cartridges, accessories and treatment products',
  description:
    'SATELLITE cartridges, drawing and practice accessories, treatment products and lamps, plus pigments and the AS PRINCESS machine. Ordering by enquiry.',
});

export default function Page() {
  return <Shop pricesStale={shopPricesExpired()} />;
}
