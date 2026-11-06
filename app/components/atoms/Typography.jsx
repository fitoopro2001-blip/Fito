// components/atoms/Typography.jsx
// Named exports so you pick exactly the scale you need:
// import { H1, Text, Caption } from '@/components/atoms/Typography';

export function H1({ children, className = '' }) {
  return (
    <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-text leading-tight ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = '' }) {
  return <h2 className={`text-3xl sm:text-4xl font-bold text-text leading-tight ${className}`}>{children}</h2>;
}

export function H3({ children, className = '' }) {
  return <h3 className={`text-2xl font-semibold text-text ${className}`}>{children}</h3>;
}

export function H4({ children, className = '' }) {
  return <h4 className={`text-xl font-semibold text-text ${className}`}>{children}</h4>;
}

export function H5({ children, className = '' }) {
  return <h5 className={`text-base font-semibold text-text ${className}`}>{children}</h5>;
}

export function Text({ children, className = '', muted = false }) {
  return <p className={`text-base ${muted ? 'text-text-muted' : 'text-text-secondary'} ${className}`}>{children}</p>;
}

export function Caption({ children, className = '' }) {
  return <span className={`text-xs uppercase tracking-wide text-text-muted ${className}`}>{children}</span>;
}
