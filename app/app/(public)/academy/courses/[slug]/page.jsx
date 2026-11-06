import CourseTemplate from '@/components/templates/CourseTemplate';
import JsonLd from '@/components/shared/JsonLd';
import { getCourseForSeo } from '@/services/seo.server';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { SITE_NAME } from '@/config/siteConfig';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseForSeo(slug);

  if (!course) {
    return buildMetadata({
      title: `Course Not Found | ${SITE_NAME}`,
      description: 'This course is unavailable.',
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${course.title} | FITOO Academy`,
    description: course.overview || course.summary,
    path: `/academy/courses/${course.slug}`,
    images: course.image ? [course.image] : [],
    imageAlt: course.title,
  });
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  // Same request as generateMetadata, deduped by fetch caching.
  const course = await getCourseForSeo(slug);

  return (
    <>
      {course && (
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: 'Academy', href: '/academy' },
              { name: course.title, href: `/academy/courses/${course.slug}` },
            ]),
          ]}
        />
      )}
      <CourseTemplate slug={slug} initialCourse={course} />
    </>
  );
}
