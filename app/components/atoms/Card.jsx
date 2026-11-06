'use client';

// Deliberately contributes no background/border of its own — callers pass
// those via className (e.g. "bg-surface border border-border") so dynamic
// states (selected/unselected, hover) can override without a specificity fight.
export default function Card({
  children,
  hoverable = false,
  onClick,
  padding = 24,
  style,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      style={{ padding, ...style }}
      className={`rounded-2xl transition-colors ${hoverable ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
