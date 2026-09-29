import Home from '@/views/Home';
import { pageMeta } from '@/lib/seo';
import { homeDescription } from '@/i18n/RootShell';

/* Wersja angielska strony głównej (ten sam widok co /; treść widoku tłumaczą słowniki widoku).
   Tytuł domyślny i opis — src/i18n/RootShell.jsx. */
export const metadata = pageMeta({ locale: 'en', route: 'home', description: homeDescription('en') });

export default function Page() {
  return <Home />;
}
