import NotFoundView from '@/components/as/NotFoundView';
import { notFoundMetadata } from '@/i18n/notFound';

/* Strona 404 wersji polskiej – także dla każdego nieznanego adresu bez prefiksu
   języka (catch-all src/app/(pl)/[...notFound]/page.jsx wywołuje notFound()). */
export const metadata = notFoundMetadata('pl');

export default function NotFound() {
  return <NotFoundView />;
}
