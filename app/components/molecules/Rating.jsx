'use client';

import { useState } from 'react';
import Icon from '../atoms/Icon';

// Read-only star display when `onChange` is omitted; interactive picker otherwise.
export default function Rating({ value = 0, onChange, size = 'w-5 h-5', className = '' }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const display = interactive ? hover || value : value;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`cursor-pointer transition-colors ${
              star <= display ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            <Icon name="star" className={size} />
          </button>
        ) : (
          <span key={star} className={star <= display ? 'text-yellow-400' : 'text-gray-600'}>
            <Icon name="star" className={size} />
          </span>
        )
      )}
    </div>
  );
}
