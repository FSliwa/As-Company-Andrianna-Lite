import NotFoundView from '@/components/as/NotFoundView';
import { notFoundMetadata } from '@/i18n/notFound';

/* Strona 404 wersji angielskiej — dla każdego nieznanego adresu /en/… (catch-all
   src/app/en/[...notFound]/page.jsx wywołuje notFound()). */
export const metadata = notFoundMetadata('en');

export default function NotFound() {
  return <NotFoundView />;
}
