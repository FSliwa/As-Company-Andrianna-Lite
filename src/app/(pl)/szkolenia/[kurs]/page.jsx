import { CoursePage } from '@/views/Education';
import { COURSES } from '@/lib/site';
import { JsonLd, breadcrumbJsonLd, coursesJsonLd, pageMeta } from '@/lib/seo';

/* Podstrona kursu /szkolenia/<id> – Filip 30.10.2026: „Do każdego szkolenia ma być osobna podstrona”.
   Adresy z COURSES[].id (stałe); inne adresy pod /szkolenia/ → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ kurs: c.id }));
}

export function generateMetadata({ params }) {
  const course = COURSES.find((c) => c.id === params.kurs);
  return pageMeta({
    path: `/szkolenia/${course.id}`,
    title: `${course.fullTitle || course.title} – szkolenie`,
    description: course.lead,
  });
}

export default function Page({ params }) {
  const course = COURSES.find((c) => c.id === params.kurs);
  return (
    <>
      <JsonLd data={coursesJsonLd('pl', course.id)} />
      <JsonLd
        data={breadcrumbJsonLd({
          path: `/szkolenia/${course.id}`,
          name: course.title,
          parent: { path: '/szkolenia', name: 'Szkolenia' },
        })}
      />
      <CoursePage id={course.id} />
    </>
  );
}
