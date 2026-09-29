import Home from '@/views/Home';
import { pageMeta } from '@/lib/seo';
import { homeDescription } from '@/i18n/RootShell';

/* Wersja rosyjska strony głównej (ten sam widok co /; treść widoku tłumaczą słowniki widoku).
   Tytuł domyślny i opis — src/i18n/RootShell.jsx. */
export const metadata = pageMeta({ locale: 'ru', route: 'home', description: homeDescription('ru') });

export default function Page() {
  return <Home />;
}
