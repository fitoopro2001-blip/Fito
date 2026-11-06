// components/atoms/Tag.jsx
const VARIANTS = {
  solid: 'bg-primary text-text-inverse',
  outline: 'border border-primary/60 text-primary bg-transparent',
  muted: 'bg-overlay-strong text-text-secondary',
};

// variant: 'solid' | 'outline' | 'muted'
export default function Tag({ children, variant = 'muted', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        VARIANTS[variant] || VARIANTS.muted
      } ${className}`}
    >
      {children}
    </span>
  );
}
