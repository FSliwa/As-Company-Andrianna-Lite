import { notFound } from 'next/navigation';
import { notFoundMetadata } from '@/i18n/notFound';

/* Każdy adres bez własnej trasy w tej gałęzi języka → markowa 404 w tym języku
   (not-found.jsx obok layoutu). Przy kilku root layoutach Next nie ma wspólnego
   app/not-found.js dla niedopasowanych adresów — dlatego catch-all.
   Pierwszeństwo mają trasy statyczne, api/, robots.txt, sitemap.xml, ikony i pliki z public/.
   Next 14.2 renderuje wtedy treść 404 w przeglądarce (HTML z serwera to powłoka błędu
   ze statusem 404 i metadanymi) — metadane 404 także tutaj, bo po hydratacji <head>
   pochodzi z metadanych tej strony. */
export const metadata = notFoundMetadata('en');

export default function CatchAllNotFound() {
  notFound();
}
