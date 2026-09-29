import Education from '@/views/Education';
import { JsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Wersja rosyjska trasy /szkolenia (ten sam widok co PL; treść widoku tłumaczą słowniki widoku).
   Wrapper serwerowy: metadata trasy w danym języku; sam widok jest komponentem klienckim. */
export const metadata = pageMeta({
  locale: 'ru',
  route: 'training',
  title: 'Обучение ПМ – Super Natural Brows',
  description:
    'Обучение Super Natural Brows и базовый курс перманентного макияжа в Babushkina Academy: программа, формат, цены нетто и расписание.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={coursesJsonLd('ru')} />
      <Education />
    </>
  );
}
