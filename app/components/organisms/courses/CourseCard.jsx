import Image from 'next/image';
import Link from 'next/link';
import Button from '../../atoms/Button';
import Icon from '../../atoms/Icon';
import CoursePrice from '../../molecules/CoursePrice';
import { DELIVERY_BADGE } from '../../../constants/courses';
import imageUrl from '../../../utils/imageUrl';

export default function CourseCard({ course }) {
  const href = `/academy/courses/${course.slug}`;

  return (
    <div className="glass border border-border-light rounded-2xl overflow-hidden flex flex-col h-full">
      <Link href={href} className="relative block w-full aspect-[16/9] bg-gradient-to-br from-primary/20 to-transparent">
        {course.image ? (
          <Image src={imageUrl(course.image)} alt={course.title} fill unoptimized className="object-cover" />
        ) : (
          // No photo yet — a branded placeholder rather than stock imagery.
          <span className="absolute inset-0 flex items-center justify-center text-primary/60 text-2xl font-bold tracking-widest">
            FITOO ACADEMY
          </span>
        )}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-background/80 text-text">
          {DELIVERY_BADGE}
        </span>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-primary text-xs font-medium uppercase tracking-wider">{course.category}</span>
        <Link href={href}>
          <h3 className="text-text font-semibold text-lg mt-1 hover:text-primary transition-colors">{course.title}</h3>
        </Link>
        <p className="text-sm text-text-muted mt-2">{course.summary}</p>

        <p className="text-sm text-text-secondary mt-4">
          {course.durationWeeks} weeks • {course.hours} teaching hours
        </p>

        <div className="mt-auto pt-5">
          <CoursePrice course={course} />
          <Button
            href={href}
            variant="primary"
            fullWidth
            className="mt-4"
            icon={<Icon name="arrowRight" className="w-4 h-4" />}
            iconPosition="right"
          >
            View Course
          </Button>
        </div>
      </div>
    </div>
  );
}
