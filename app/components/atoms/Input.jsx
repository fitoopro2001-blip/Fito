'use client';

import { useState } from 'react';

export default function Input({ id, label, icon, suffix, error, type = 'text', className = '', ...rest }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && visible ? 'text' : type;
  const hasRightAdornment = isPassword || suffix;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>}
        <input
          id={id}
          type={resolvedType}
          className={`w-full rounded-md bg-overlay border text-text placeholder:text-text-muted text-sm py-2.5 outline-none transition-colors ${
            error ? 'border-danger' : 'border-border-light focus:border-primary'
          } ${icon ? 'pl-10' : 'pl-4'} ${hasRightAdornment ? 'pr-12' : 'pr-4'}`}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary text-xs"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        ) : suffix ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            {suffix}
          </span>
        ) : null}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
