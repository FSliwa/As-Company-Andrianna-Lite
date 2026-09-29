import BookingRoute, { isBookingEnabled } from '@/components/booking/BookingRoute';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; stan rezerwacji, znacznik formularza i czas
   serwera składa BookingRoute (wspólny z /en/book i /ru/book). Zmienne środowiskowe
   czytane w chwili żądania – dlatego trasa jest dynamiczna. */
export const dynamic = 'force-dynamic';

/* Bez skonfigurowanego kalendarza strona pokazuje tylko komunikat – noindex. */
export function generateMetadata() {
  return pageMeta({
    title: 'Umów wizytę',
    description:
      'Rezerwacja online w Babushkina Academy, Warszawa – wybierz zabieg makijażu permanentnego brwi, ust lub kresek, dzień i godzinę wizyty.',
    path: '/umow-wizyte',
    noindex: !isBookingEnabled(),
  });
}

export default function Page() {
  return <BookingRoute />;
}
