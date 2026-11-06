// components/atoms/Badge.jsx
// Wraps any element (usually an icon button) with a count or dot indicator.
// <Badge count={3}><button><Icon name="bell" /></button></Badge>

export default function Badge({ children, count = 0, dot = false, max = 99, className = '' }) {
  const showCount = !dot && count > 0;
  const display = count > max ? `${max}+` : count;

  return (
    <span className={`relative inline-flex ${className}`}>
      {children}
      {(dot || showCount) && (
        <span
          className={
            dot
              ? 'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-background'
              : 'absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-danger text-text text-[10px] leading-4 text-center font-medium'
          }
        >
          {showCount ? display : null}
        </span>
      )}
    </span>
  );
}
