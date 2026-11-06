'use client';

export default function QuantitySelector({ value = 1, onChange, min = 1, max = 99, className = '' }) {
  const decrement = () => onChange?.(Math.max(min, value - 1));
  const increment = () => onChange?.(Math.min(max, value + 1));

  return (
    <div className={`inline-flex items-center border border-border-light rounded-full overflow-hidden shrink-0 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-overlay-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm text-text font-medium">{value}</span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-overlay-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
