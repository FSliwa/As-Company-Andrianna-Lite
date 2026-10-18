import Shop from '@/views/Shop';
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo';
import { shopPricesExpired } from '@/lib/shop';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   Sklep – prośba klientki z 18.10.2026 (dane: src/data/shop.json).
   `pricesStale` – czy ceny sklepu były już przeterminowane w chwili renderu (build). */
export const metadata = pageMeta({
  title: 'Sklep – kartridże, akcesoria i środki do PMU',
  description:
    'Kartridże SATELLITE, akcesoria do rysunku i ćwiczeń, środki zabiegowe i lampy oraz pigmenty i maszynka AS PRINCESS. Ceny i zamówienie przez zapytanie.',
  path: '/sklep',
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd({ path: '/sklep', name: 'Sklep' })} />
      <Shop pricesStale={shopPricesExpired()} />
    </>
  );
}
