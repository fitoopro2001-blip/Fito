'use client';

import { useMemo } from 'react';
import { H2, Text } from '../../components/atoms/Typography';
import ProductCard from './ProductCard';
import ProductCardSkeleton from '../molecules/ProductCardSkeleton';
import useApiResource from '../../hooks/useApiResource';
import useWishlist from '../../hooks/useWishlist';
import { getProducts } from '../../services/product.service';
import { useCountry } from '../../context/CountryContext';

export default function FeaturedProducts({
  title = 'Featured Supplements',
  subtitle = 'Our top‑selling products, handpicked for quality and performance.',
  limit = 8,
  excludeId,
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { productsAvailable } = useCountry();

  // No `sort` param: falls back to the backend's default, which follows the
  // admin's manual drag-to-reorder order (Product.sortOrder). Skipped
  // entirely where products aren't available — showing a marketing section
  // for something that can't be bought would be confusing, so it just
  // doesn't render (see the early return below) rather than showing a notice.
  const { data: apiProducts, loading } = useApiResource(() => getProducts(), [], {
    skip: !productsAvailable,
    fallback: [],
  });

  const products = useMemo(() => {
    return (apiProducts ?? []).filter((p) => p.id !== excludeId).slice(0, limit);
  }, [apiProducts, excludeId, limit]);

  if (!productsAvailable) {
    return null;
  }

  return (
    <section className="relative py-20 section-defer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-12 reveal">
            <H2>{title}</H2>
            {subtitle && (
              <Text muted className="mt-3 max-w-xl mx-auto">
                {subtitle}
              </Text>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Text muted className="text-center py-10">
            No products available yet.
          </Text>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
