import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import imageUrl from '../../utils/imageUrl';
import formatCategory from '../../utils/formatCategory';
import stripHtml from '../../utils/stripHtml';
import ProductCardActions from './ProductCardActions';

// Static star geometry — hoisted out of render so it isn't rebuilt per card.
const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

function Star({ fill }) {
  return (
    <svg
      className={`w-4 h-4 ${fill === 'none' ? 'text-text-muted' : 'text-primary'}`}
      viewBox="0 0 24 24"
      fill={fill === 'full' ? 'currentColor' : fill === 'half' ? 'url(#halfStar)' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

function Stars({ rating = 0 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} fill={i < full ? 'full' : i === full && half ? 'half' : 'none'} />
      ))}
    </div>
  );
}

function ProductCard({ product, isWishlisted = false, onToggleWishlist }) {
  const href = `/product/${product.slug || product.id}`;

  return (
    // Card is a plain element, not an anchor. The link is a stretched overlay
    // (see below), which is valid HTML — the previous button-inside-anchor
    // nesting is what required all the stopPropagation handlers.
    <div className="group relative glass border border-border-light rounded-2xl p-4 flex flex-col hover-lift hover:border-primary/30">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-overlay mb-4">
        <Image
          src={imageUrl(product.image)}
          alt={product.seo?.imageAlt || product.name}
          fill
          // Tells the optimizer the real rendered width per breakpoint. Without
          // it, next/image assumes 100vw and ships a ~1200px file to a phone
          // that only ever paints it around 340px.
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        {product.status === 'coming_soon' && (
          <span className="absolute top-3 left-3 z-10 rounded-full glass-strong border border-border-light px-3 py-1 text-xs font-semibold text-primary">
            Coming Soon
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="text-text font-semibold text-lg leading-tight">
          {/* Stretched link: covers the whole card for pointer users, stays a
              single normal link for keyboard and screen readers. */}
          <Link href={href} className="after:absolute after:inset-0 after:z-0">
            {product.name}
          </Link>
        </h3>

        <span className="text-sm text-text-muted mb-1">{formatCategory(product.category)}</span>

        <div className="flex items-center gap-2 mt-1">
          <Stars rating={product.rating ?? 0} />
          <span className="text-sm text-text-muted">({product.reviews ?? 0})</span>
        </div>

        <p className="text-sm text-text-muted mt-2 flex-1 line-clamp-2">{stripHtml(product.description)}</p>
      </div>

      {/* Interactive bits are a small client island; the rest of the card stays
          server-rendered with no cart context and no hydration cost. */}
      <ProductCardActions
        product={product}
        isWishlisted={isWishlisted}
        onToggleWishlist={onToggleWishlist}
      />
    </div>
  );
}

// Grids render 8+ of these; memo stops a cart change from re-rendering cards
// whose props didn't move.
export default memo(ProductCard);
