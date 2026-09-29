import BookingRoute, { isBookingEnabled } from '@/components/booking/BookingRoute';
import { pageMeta } from '@/lib/seo';

/* Wersja angielska trasy /umow-wizyte. Stan rezerwacji, znacznik formularza i czas serwera
   składa BookingRoute (wspólny dla trzech języków). Zmienne środowiskowe czytane
   w chwili żądania — dlatego trasa jest dynamiczna. */
export const dynamic = 'force-dynamic';

/* Bez skonfigurowanego kalendarza strona pokazuje tylko komunikat — noindex. */
export function generateMetadata() {
  return pageMeta({
    locale: 'en',
    route: 'book',
    title: 'Book a visit',
    description:
      'Online booking at Babushkina Academy, Warsaw — choose a permanent makeup treatment for brows, lips or eyeliner, and the day and time of your visit.',
    noindex: !isBookingEnabled(),
  });
}

export default function Page() {
  return <BookingRoute />;
}
