import { CoursePage } from '@/views/Education';
import { getSite } from '@/i18n/site';
import { JsonLd, breadcrumbJsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Wersja RU podstrony kursu /szkolenia/<id> (ten sam widok co PL; treść z getSite('ru')). */
const { COURSES } = getSite('ru');

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ course: c.id }));
}

export function generateMetadata({ params }) {
  const course = COURSES.find((c) => c.id === params.course);
  return pageMeta({
    locale: 'ru',
    path: `/szkolenia/${course.id}`,
    title: `${course.fullTitle || course.title} – курс`,
    description: course.lead,
  });
}

export default function Page({ params }) {
  const course = COURSES.find((c) => c.id === params.course);
  return (
    <>
      <JsonLd data={coursesJsonLd('ru', course.id)} />
      <JsonLd
        data={breadcrumbJsonLd({
          locale: 'ru',
          path: `/szkolenia/${course.id}`,
          name: course.title,
          parent: { path: '/szkolenia', name: 'Обучение' },
        })}
      />
      <CoursePage id={course.id} />
    </>
  );
}
