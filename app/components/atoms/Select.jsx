'use client';

// options: [{ label, value }] — value can be any type (string/number),
// the original value (not the stringified DOM one) is what onChange receives.
export default function Select({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  id,
}) {
  const handleChange = (e) => {
    const raw = e.target.value;
    const match = options.find((opt) => String(opt.value) === raw);
    onChange?.(match ? match.value : raw);
  };

  return (
    <select
      id={id}
      disabled={disabled}
      value={value ?? ''}
      onChange={handleChange}
      className={`w-full rounded-md bg-overlay border border-border-light text-text text-sm py-2.5 px-4 outline-none transition-colors focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-surface text-text">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
