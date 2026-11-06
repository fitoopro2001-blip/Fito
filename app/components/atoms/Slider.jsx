'use client';

export default function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-overlay-strong accent-primary cursor-pointer disabled:opacity-50"
      />
      <span className="text-sm text-text-secondary w-10 text-right tabular-nums shrink-0">
        {value ?? min}
      </span>
    </div>
  );
}
