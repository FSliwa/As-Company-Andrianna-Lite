import Pigments from '@/views/Pigments';
import { pageMeta } from '@/lib/seo';
import { pricesExpired, stats } from '@/lib/pigments';
import { plural } from '@/i18n/format';

/* Wersja rosyjska trasy /pigmenty. Wrapper serwerowy: metadata trasy; sam widok jest
   komponentem klienckim. Liczby w opisie z danych katalogu (src/data/pigments.json).
   `pricesStale` – czy ceny były już przeterminowane w chwili renderu (build);
   widok sprawdza to ponownie w przeglądarce. */
const s = stats();
const shades = plural('ru', s.shades, { one: 'оттенок', few: 'оттенка', many: 'оттенков' });
const sets = plural('ru', s.sets, { one: 'набор', few: 'набора', many: 'наборов' });
const collections = plural('ru', s.collections, { one: 'коллекции', few: 'коллекциях', many: 'коллекциях' });
const full = `Каталог пигментов для ПМ: ${s.shades} ${shades} и ${s.sets} ${sets} в ${s.collections} ${collections} – AS OPIUM, Light Minerals, AS Classic. Цены, объёмы и заказ по запросу.`;
const short = `Каталог пигментов для ПМ: ${s.shades} ${shades} – AS OPIUM, Light Minerals, AS Classic. Цены, объёмы и заказ по запросу.`;

export const metadata = pageMeta({
  locale: 'ru',
  route: 'pigments',
  title: 'Пигменты для ПМ – каталог оттенков',
  description: full.length <= 155 ? full : short,
});

export default function Page() {
  return <Pigments pricesStale={pricesExpired()} />;
}
