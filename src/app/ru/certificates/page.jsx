import Certificates from '@/views/Certificates';
import { pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /certyfikaty (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'certificates',
  title: 'Документация продукции',
  description:
    'Какие документы мы предоставляем к продуктам для ПМ – декларации соответствия, паспорта безопасности и документация к оборудованию.',
});

export default function Page() {
  return <Certificates />;
}
