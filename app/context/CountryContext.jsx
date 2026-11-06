'use client';

import { createContext, useContext, useMemo } from 'react';
import { getCurrencyForCountry, isProductAvailable } from '../utils/country';

const CountryContext = createContext(null);

// Seeded from the cookie middleware.ts sets (read server-side in
// app/layout.jsx via getServerCountry()), so there's no client-side flash
// while a cookie is parsed — the value is correct on first render.
export function CountryProvider({ initialCountry = null, children }) {
  const value = useMemo(
    () => ({
      country: initialCountry,
      currency: getCurrencyForCountry(initialCountry),
      productsAvailable: isProductAvailable(initialCountry),
    }),
    [initialCountry]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return ctx;
}
