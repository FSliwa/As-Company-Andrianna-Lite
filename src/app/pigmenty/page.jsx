import Pigments from '@/views/Pigments';
import { pageMeta } from '@/lib/seo';
import { stats } from '@/lib/pigments';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   Liczby w opisie z danych katalogu (src/data/pigments.json). */
const s = stats();
const full = `Katalog ${s.shades} odcieni i ${s.sets} zestawów pigmentów PMU w ${s.collections} kolekcjach — AS OPIUM, Light Minerals, AS Classic. Ceny, pojemności i zamówienie przez zapytanie.`;
const short = `Katalog ${s.shades} odcieni pigmentów PMU: AS OPIUM, Light Minerals, AS Classic. Ceny, pojemności i zamówienie przez zapytanie.`;

export const metadata = pageMeta({
  title: 'Pigmenty PMU — katalog odcieni',
  description: full.length <= 155 ? full : short,
  path: '/pigmenty',
});

export default function Page() {
  return <Pigments />;
}
