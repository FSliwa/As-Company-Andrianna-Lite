import Certificates from '@/views/Certificates';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /certyfikaty (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'certificates',
  title: 'Документация продукции',
  description:
    'Документация к продукции из нашего ассортимента: пигменты, соответствующие регламенту REACH, и их паспорта безопасности.',
});

export default function Page() {
  return <Certificates />;
}
