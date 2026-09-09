'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorageState from '../hooks/useLocalStorageState';
import { trackEvent } from '../lib/fbpixel';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useLocalStorageState('Fitoo_wishlist', []);

  const addToWishlist = useCallback(
    (product) => {
      if (items.some((item) => item.id === product.id)) return;
      setItems([
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice,
          image: product.image,
          category: product.category,
          slug: product.slug,
        },
      ]);

      trackEvent('AddToWishlist', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.discountedPrice ?? product.price,
        currency: 'PKR',
      });
    },
    [items, setItems]
  );

  const removeFromWishlist = useCallback(
    (id) => {
      setItems(items.filter((item) => item.id !== id));
    },
    [items, setItems]
  );

  const isWishlisted = useCallback((id) => items.some((item) => item.id === id), [items]);

  const toggleWishlist = useCallback(
    (product) => {
      if (isWishlisted(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [isWishlisted, removeFromWishlist, addToWishlist]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const totalItems = items.length;

  const value = useMemo(
    () => ({
      items,
      totalItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
    }),
    [items, totalItems, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return ctx;
}
