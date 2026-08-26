'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorageState from '../hooks/useLocalStorageState';
import { useCountry } from './CountryContext';

const CartContext = createContext(null);

// A variant's identity in the cart — its sku when it has one, else its name.
// `null` for a product with no variant selected, so it collapses back to the
// old single-line-per-product behavior.
const variantKeyOf = (variant) => (variant ? variant.sku?.trim() || variant.name : null);

// The cart key a line item is grouped/matched by. Two different variants of
// the same product get distinct lines; the same variant (or no variant) adds
// onto the existing line.
const lineIdOf = (productId, variantKey) => (variantKey ? `${productId}::${variantKey}` : String(productId));

// Carts persisted before variants existed have no `lineId` — fall back to the
// product id so those items stay addressable.
const lineKeyOf = (item) => item.lineId ?? String(item.id);

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorageState('Fitoo_cart', []);
  const { productsAvailable } = useCountry();

  const addToCart = useCallback(
    (product, quantity = 1, variant = null) => {
      // Physical products only ship within Pakistan — this is the last line
      // of client-side defense (every page/button that calls addToCart is
      // already gated on productsAvailable), backed by the backend's own
      // restrictToPakistan check on order creation, which can't be bypassed.
      if (!productsAvailable) return;
      const variantKey = variantKeyOf(variant);
      const lineId = lineIdOf(product.id, variantKey);
      const existing = items.find((item) => lineKeyOf(item) === lineId);
      const next = existing
        ? items.map((item) =>
          lineKeyOf(item) === lineId ? { ...item, quantity: item.quantity + quantity } : item
        )
        : [
          ...items,
          {
            id: product.id,
            lineId,
            name: product.name,
            // A variant's own price overrides the product price when set;
            // otherwise charges the discounted amount automatically wherever
            // a product has an active discount — see toPublicProduct.
            price: variant?.price ?? product.discountedPrice ?? product.price,
            image: product.image,
            quantity,
            variantName: variant?.name,
            variantSku: variant?.sku,
          },
        ];
      setItems(next);
    },
    [items, setItems, productsAvailable]
  );

  const removeFromCart = useCallback(
    (lineId) => {
      setItems(items.filter((item) => lineKeyOf(item) !== lineId));
    },
    [items, setItems]
  );

  const updateQuantity = useCallback(
    (lineId, quantity) => {
      if (quantity <= 0) {
        setItems(items.filter((item) => lineKeyOf(item) !== lineId));
        return;
      }
      setItems(items.map((item) => (lineKeyOf(item) === lineId ? { ...item, quantity } : item)));
    },
    [items, setItems]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  // Pass a variant to check whether that specific variant's line is in the
  // cart; omit it to check the plain (no-variant) line.
  const isInCart = useCallback(
    (id, variant = null) => items.some((item) => lineKeyOf(item) === lineIdOf(id, variantKeyOf(variant))),
    [items]
  );

  // Derived in one pass and memoized — this context sits above every page, so
  // it re-runs on any ancestor render otherwise.
  const { totalItems, totalPrice } = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.totalItems += item.quantity;
          acc.totalPrice += item.quantity * item.price;
          return acc;
        },
        { totalItems: 0, totalPrice: 0 }
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    }),
    [items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return ctx;
}
