import Pigments from '@/views/Pigments';
import { pageMeta } from '@/lib/seo';
import { pricesExpired, stats } from '@/lib/pigments';
import { plural } from '@/i18n/format';

/* Wersja angielska trasy /pigmenty. Wrapper serwerowy: metadata trasy; sam widok jest
   komponentem klienckim. Liczby w opisie z danych katalogu (src/data/pigments.json).
   `pricesStale` – czy ceny były już przeterminowane w chwili renderu (build);
   widok sprawdza to ponownie w przeglądarce. */
const s = stats();
const full = `Catalogue of ${s.shades} ${plural('en', s.shades, { one: 'shade', other: 'shades' })} and ${s.sets} ${plural('en', s.sets, { one: 'set', other: 'sets' })} of PMU pigments in ${s.collections} ${plural('en', s.collections, { one: 'collection', other: 'collections' })} – AS OPIUM, Light Minerals, AS Classic. Prices, volumes and ordering by enquiry.`;
const short = `Catalogue of ${s.shades} PMU pigment ${plural('en', s.shades, { one: 'shade', other: 'shades' })}: AS OPIUM, Light Minerals, AS Classic. Prices, volumes and ordering by enquiry.`;

export const metadata = pageMeta({
  locale: 'en',
  route: 'pigments',
  title: 'PMU pigments – shade catalogue',
  description: full.length <= 155 ? full : short,
});

export default function Page() {
  return <Pigments pricesStale={pricesExpired()} />;
}
