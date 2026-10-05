import Treatments from '@/views/Treatments';
import { JsonLd, breadcrumbJsonLd, pageMeta, treatmentsJsonLd } from '@/lib/seo';
import { PRICING_PMU } from '@/lib/site';

/* Opis z cenami składany z cennika (PRICING_PMU) – zmiana ceny nie rozjedzie się z opisem. */
const price = (id) => PRICING_PMU.items.find((i) => i.id === id)?.price;

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D2: nazwy technik wg briefu (Perfect Brows, Perfect Eyes – pigmentacja linii rzęs). */
export const metadata = pageMeta({
  /* Fraza i miasto na początku (audyt SEO 5.10.2026): 48 znaków + „ | Babushkina Academy”. */
  title: 'Makijaż permanentny brwi i ust Warszawa – cennik',
  description: `Makijaż permanentny brwi (włos maszynowy, technika pudrowa), ust i linii rzęs w Warszawie. Cennik: brwi i usta ${price('super-natural-brows')}, linia rzęs ${price('perfect-eyeliners')}, korekta ${price('korekta')}.`,
  path: '/uslugi',
});

export default function Page() {
  return (
    <>
      <JsonLd data={treatmentsJsonLd()} />
      <JsonLd data={breadcrumbJsonLd({ path: '/uslugi', name: 'Zabiegi i cennik' })} />
      <Treatments />
    </>
  );
}
