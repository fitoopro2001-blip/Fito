import { formatPrice } from '../../utils/formatCurrency';

// The fee actually charged, with the actual price struck through beside it
// whenever the course is discounted (course.originalPrice is null otherwise).
export default function CoursePrice({ course, size = 'md' }) {
  const priceClass = size === 'lg' ? 'text-4xl' : 'text-2xl';

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`${priceClass} font-bold text-primary whitespace-nowrap`}>
        {formatPrice(course.price, course.currency)}
      </span>
      {course.originalPrice && (
        <>
          <span className="text-text-muted line-through whitespace-nowrap">
            {formatPrice(course.originalPrice, course.currency)}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success whitespace-nowrap">
            {course.discountPercent}% off
          </span>
        </>
      )}
    </div>
  );
}
