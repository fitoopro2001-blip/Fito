// components/atoms/Avatar.jsx
import NextImage from 'next/image';

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

// Pass `src` for a photo, or just `name` to fall back to initials on a primary chip
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const sizeClasses = SIZES[size] || SIZES.md;

  if (src) {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 ${sizeClasses} ${className}`}>
        <NextImage src={src} alt={name || 'Avatar'} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary text-text-inverse font-semibold shrink-0 ${sizeClasses} ${className}`}
    >
      {getInitials(name) || '?'}
    </div>
  );
}
