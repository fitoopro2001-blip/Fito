'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import imageUrl from '../../utils/imageUrl';

// `alt` is the SEO alt text generated for the product; it falls back to a
// generic label so the gallery still works for non-product images.
const ImageGallery = ({ images, alt = 'Product image' }) => {
  const [selectedImage, setSelectedImage] = useState(images?.[0] || '');

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl aspect-square flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Vertical Thumbnails */}
      <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[500px]">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border' : 'border-transparent'
              }`}
          >
            <Image
              src={imageUrl(img)}
              alt={`${alt} — view ${idx + 1}`}
              fill
              unoptimized
              className="object-cover hover:scale-105 transition"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative  min-h-[300px] flex-1 border-2 rounded-2xl overflow-hidden bg-white/5 order-1 md:order-2">
        <Image
          src={imageUrl(selectedImage)}
          alt={alt}
          fill
          unoptimized
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default ImageGallery;