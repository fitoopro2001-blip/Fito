// Shimmering placeholder block. Compose with width/height utility classes,
// e.g. <Skeleton className="w-24 h-4" /> or <Skeleton className="w-11 h-11" rounded="rounded-xl" />.
export default function Skeleton({ className = '', rounded = 'rounded-md', style }) {
    return <div className={`skeleton ${rounded} ${className}`} style={style} aria-hidden="true" />;
}
