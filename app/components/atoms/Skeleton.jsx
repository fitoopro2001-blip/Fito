// Shimmering placeholder block. Compose with width/height utility classes,
// e.g. <Skeleton className="w-24 h-4" /> or <Skeleton className="aspect-square" rounded="rounded-xl" />.
export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />;
}
