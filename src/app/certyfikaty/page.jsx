import Certificates from '@/views/Certificates';
import { pageMeta } from '@/lib/seo';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  title: 'Dokumentacja produktów',
  description:
    'Jakie dokumenty udostępniamy do produktów PMU — deklaracje zgodności, karty charakterystyki i dokumentacja urządzeń.',
  path: '/certyfikaty',
});

export default function Page() {
  return <Certificates />;
}
