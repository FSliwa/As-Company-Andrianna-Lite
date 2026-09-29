import BookingRoute, { isBookingEnabled } from '@/components/booking/BookingRoute';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /umow-wizyte. Stan rezerwacji, znacznik formularza i czas serwera
   składa BookingRoute (wspólny dla trzech języków). Zmienne środowiskowe czytane
   w chwili żądania – dlatego trasa jest dynamiczna. */
export const dynamic = 'force-dynamic';

/* Bez skonfigurowanego kalendarza strona pokazuje tylko komunikat – noindex. */
export function generateMetadata() {
  return pageMeta({
    locale: 'ru',
    route: 'book',
    title: 'Записаться',
    description:
      'Онлайн-запись в Babushkina Academy, Варшава – выберите процедуру перманентного макияжа бровей, губ или межресничной линии, день и время визита.',
    noindex: !isBookingEnabled(),
  });
}

export default function Page() {
  return <BookingRoute />;
}
