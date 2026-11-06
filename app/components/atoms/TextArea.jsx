'use client';

export default function TextArea({
  id,
  label,
  error,
  rows = 4,
  className = '',
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full rounded-md bg-overlay border text-text placeholder:text-text-muted text-sm py-2.5 px-4 outline-none transition-colors resize-none ${
          error ? 'border-danger' : 'border-border-light focus:border-primary'
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
