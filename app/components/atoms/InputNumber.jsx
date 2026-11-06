'use client';

export default function InputNumber({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  disabled = false,
  id,
  className = '',
}) {
  const handleChange = (e) => {
    const raw = e.target.value;
    onChange?.(raw === '' ? undefined : Number(raw));
  };

  return (
    <input
      id={id}
      type="number"
      value={value ?? ''}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-md bg-overlay border border-border-light text-text placeholder:text-text-muted text-sm py-2.5 px-4 outline-none transition-colors focus:border-primary disabled:opacity-50 ${className}`}
    />
  );
}
