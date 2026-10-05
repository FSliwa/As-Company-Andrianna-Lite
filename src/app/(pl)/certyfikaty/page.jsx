import Certificates from '@/views/Certificates';
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   D9: REACH w brzmieniu sklepu klientki („pigmenty zgodne z rozporządzeniem REACH”);
   D10: bez „deklaracji zgodności” i „dokumentacji urządzeń” – brak źródła. */
export const metadata = pageMeta({
  /* zgodnie z H1 strony i zapytaniem linergistek (karta charakterystyki, REACH) */
  title: 'Karty charakterystyki pigmentów PMU (REACH)',
  description:
    'Dokumentacja produktów z naszej oferty: pigmenty zgodne z rozporządzeniem REACH i ich karty charakterystyki.',
  path: '/certyfikaty',
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd({ path: '/certyfikaty', name: 'Dokumentacja produktów' })} />
      <Certificates />
    </>
  );
}
