// components/atoms/Image.jsx
'use client';

import { useState } from 'react';
import NextImage from 'next/image';

// Thin wrapper around next/image that adds a pulse skeleton while loading.
// Use fill+a positioned parent, or pass width/height directly.
export default function Image({
  src,
  alt,
  fill = false,
  width,
  height,
  rounded = '',
  objectFit = 'cover',
  className = '',
  unoptimized = true,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${rounded} ${fill ? 'w-full h-full' : ''}`}>
      {!loaded && <div className={`absolute inset-0 bg-overlay animate-pulse ${rounded}`} />}
      <NextImage
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        unoptimized={unoptimized}
        onLoad={() => setLoaded(true)}
        className={`${fill ? (objectFit === 'contain' ? 'object-contain' : 'object-cover') : ''} ${rounded} transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...rest}
      />
    </div>
  );
}