import Home from '@/views/Home';
import { pageMeta } from '@/lib/seo';
import { homeDescription } from '@/i18n/RootShell';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim.
   Tytuł domyślny i opis (ten sam co w <head> całego serwisu) – src/i18n/RootShell.jsx. */
export const metadata = pageMeta({ description: homeDescription('pl'), path: '/' });

export default function Page() {
  return <Home />;
}
