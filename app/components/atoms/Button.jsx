// components/atoms/Button.jsx
'use client';

import Link from 'next/link';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-primary border border-primary text-text-inverse hover:bg-primary-hover',
  outline: 'bg-transparent border border-border text-text hover:bg-overlay-strong',
  ghost: 'bg-transparent border border-transparent text-text-secondary hover:text-text',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-4 py-2 gap-1.5 rounded-md',
  lg: 'text-base px-8 py-3 gap-2 rounded-md',
};

// variant: 'primary' | 'outline' | 'ghost'
// size: 'sm' | 'md' | 'lg'
// href: renders a Next.js Link instead of a <button>
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  href,
  className = '',
  ...rest
}) {
  const classes = `inline-flex items-center cursor-pointer justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
    VARIANTS[variant] || VARIANTS.primary
  } ${SIZES[size] || SIZES.md} ${fullWidth ? 'w-full' : ''} ${className}`;

  const content = (
    <>
      {loading ? <Spinner className="w-4 h-4" /> : icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
