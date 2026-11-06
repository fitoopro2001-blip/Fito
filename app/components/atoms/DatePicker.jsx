'use client';

import dayjs from 'dayjs';

// Accepts either a raw ISO string or a dayjs instance for `value`, and calls
// onChange with a dayjs instance (or null) so existing `date?.toISOString()`
// call sites keep working unchanged.
export default function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  className = '',
}) {
  const stringValue = value ? dayjs(value).format('YYYY-MM-DD') : '';

  const handleChange = (e) => {
    const raw = e.target.value;
    onChange?.(raw ? dayjs(raw) : null);
  };

  return (
    <input
      id={id}
      type="date"
      value={stringValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full rounded-md bg-overlay border border-border-light text-text text-sm py-2.5 px-4 outline-none transition-colors focus:border-primary disabled:opacity-50 [color-scheme:dark] ${className}`}
    />
  );
}
