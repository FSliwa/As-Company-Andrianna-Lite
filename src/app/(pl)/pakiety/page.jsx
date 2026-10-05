import Packages from '@/views/Packages';
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D6: bez „konsultacji” (brak źródła, że to osobna wizyta) i bez „ceny każdego kroku”;
   terminy z briefu: korekta po miesiącu do 3 miesięcy, odświeżenie raz na 1–3 lata. */
export const metadata = pageMeta({
  /* fraza, której szuka klientka (nazwa w menu i okruszkach zostaje: „Ścieżka zabiegowa”) */
  title: 'Korekta i odświeżenie makijażu permanentnego',
  description:
    'Zabieg, korekta po 1–3 miesiącach i odświeżenie co 1–3 lata – kolejne kroki makijażu permanentnego i ich ceny według cennika.',
  path: '/pakiety',
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd({ path: '/pakiety', name: 'Ścieżka zabiegowa' })} />
      <Packages />
    </>
  );
}
