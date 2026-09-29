import NotFoundView from '@/components/as/NotFoundView';
import { notFoundMetadata } from '@/i18n/notFound';

/* Strona 404 wersji rosyjskiej — dla każdego nieznanego adresu /ru/… (catch-all
   src/app/ru/[...notFound]/page.jsx wywołuje notFound()). */
export const metadata = notFoundMetadata('ru');

export default function NotFound() {
  return <NotFoundView />;
}
