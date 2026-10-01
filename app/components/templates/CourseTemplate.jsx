'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { H2, Text } from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Spinner from '../atoms/Spinner';
import CoursePrice from '../molecules/CoursePrice';
import CourseEnrollModal from '../organisms/courses/CourseEnrollModal';
import useApiResource from '../../hooks/useApiResource';
import useAuth from '../../hooks/useAuth';
import { getCourseBySlug, getMyEnrollments } from '../../services/course.service';
import { DELIVERY_BADGE, ENROLLMENT_STATUS_LABEL } from '../../constants/courses';
import imageUrl from '../../utils/imageUrl';

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-text mb-3">{title}</h2>
      {children}
    </section>
  );
}

// Interactive half of the course detail page. The route's server component
// owns metadata and structured data.
export default function CourseTemplate({ slug, initialCourse = null }) {
  const { isAuthenticated } = useAuth();
  const [enrolOpen, setEnrolOpen] = useState(false);

  const { data, loading, error } = useApiResource(() => getCourseBySlug(slug), [slug], {
    // The server component already fetched this course for metadata.
    skip: !slug || Boolean(initialCourse),
    fallback: initialCourse,
  });
  const course = data ?? initialCourse;

  // The learner's own enrolments, to show where they stand on this course
  // instead of offering to enrol twice.
  const { data: myEnrollments, reload: reloadEnrollments } = useApiResource(getMyEnrollments, [isAuthenticated], {
    skip: !isAuthenticated,
    fallback: [],
  });

  if (loading && !course) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <H2>Course Not Found</H2>
          <Text muted className="mt-2">
            {error || "That course doesn't exist or is no longer available."}
          </Text>
          <Link href="/academy" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-6">
            Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  // Latest pending/approved enrolment for this course; a rejected one doesn't
  // block enrolling again.
  const enrollment = (myEnrollments ?? []).find(
    (item) => String(item.courseId) === String(course.id) && item.status !== 'rejected'
  );

  const enrolAction = enrollment ? (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-text">
      <span className="font-semibold">{ENROLLMENT_STATUS_LABEL[enrollment.status]}</span>
      <span className="block text-text-muted mt-0.5">
        {enrollment.status === 'approved'
          ? 'Your payment is verified. Our team will share your batch schedule.'
          : "We're verifying your payment — you'll get an email once it's approved."}
      </span>
    </div>
  ) : isAuthenticated ? (
    <Button variant="primary" size="lg" fullWidth onClick={() => setEnrolOpen(true)}>
      Enrol Now
    </Button>
  ) : (
    <>
      <Button href="/login" variant="primary" size="lg" fullWidth>
        Log In to Enrol
      </Button>
      <Text muted className="text-xs mt-2 text-center">
        You need an account to enrol in a course.
      </Text>
    </>
  );

  const facts = [
    { label: 'Duration', value: `${course.durationWeeks} weeks` },
    { label: 'Teaching hours', value: `${course.hours} hours` },
    course.schedule && { label: 'Schedule', value: course.schedule },
    { label: 'Format', value: DELIVERY_BADGE },
    course.venue && { label: 'Venue', value: course.venue },
    course.batchGuidance && { label: 'Batch size', value: course.batchGuidance },
  ].filter(Boolean);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-8"
        >
          <Icon name="arrowRight" className="w-4 h-4 rotate-180" />
          Back to Academy
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2">
            <span className="text-primary text-sm font-medium uppercase tracking-wider">{course.category}</span>
            {/* Single H1 per page so the course title is the page's main heading. */}
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-text">{course.title}</h1>
            <Text className="mt-3 text-lg">{course.summary}</Text>

            {course.image && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mt-8">
                <Image src={imageUrl(course.image)} alt={course.title} fill unoptimized className="object-cover" priority />
              </div>
            )}

            {course.overview && (
              <Section title="Overview">
                <Text>{course.overview}</Text>
              </Section>
            )}

            {course.audience && (
              <Section title="Who It Is For">
                <Text>{course.audience}</Text>
              </Section>
            )}

            {course.outcomes.length > 0 && (
              <Section title="Learning Outcomes">
                <ul className="flex flex-col gap-2">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3 text-text-secondary">
                      <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {course.curriculum.length > 0 && (
              <Section title="Weekly Curriculum">
                <div className="flex flex-col gap-3">
                  {course.curriculum.map((row) => (
                    <div key={row.week} className="glass border border-border-light rounded-xl p-4 flex gap-4">
                      <span className="shrink-0 w-16 text-sm font-semibold text-primary">Week {row.week}</span>
                      <div>
                        <div className="text-text font-medium">{row.topic}</div>
                        {row.practical && <div className="text-sm text-text-muted mt-1">Practical: {row.practical}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {course.inclusions && (
              <Section title="Included Materials and Experience">
                <Text>{course.inclusions}</Text>
              </Section>
            )}

            {course.assessment && (
              <Section title="Assessment and Certificate">
                <Text>{course.assessment}</Text>
                <Text muted className="mt-3 text-sm">
                  FITOO Academy issues a private Certificate of Completion to learners who meet the attendance and
                  assessment requirements. It is not a university degree, professional licence or third party
                  accreditation.
                </Text>
              </Section>
            )}

            {course.disclaimer && (
              <Section title="Scope and Important Details">
                <Text muted>{course.disclaimer}</Text>
              </Section>
            )}
          </article>

          <aside>
            <div className="glass border border-border-light rounded-2xl p-6 lg:sticky lg:top-24">
              <Text muted className="text-sm mb-1">Course Fee</Text>
              <CoursePrice course={course} size="lg" />

              <dl className="mt-6 flex flex-col gap-3">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs uppercase tracking-wide text-text-muted">{fact.label}</dt>
                    <dd className="text-sm text-text mt-0.5">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">{enrolAction}</div>
            </div>
          </aside>
        </div>
      </div>

      <CourseEnrollModal
        open={enrolOpen}
        onClose={() => setEnrolOpen(false)}
        course={course}
        onEnrolled={reloadEnrollments}
      />
    </div>
  );
}
