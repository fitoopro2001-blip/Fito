import { cookies } from 'next/headers';
import { COUNTRY_COOKIE, getCurrencyForCountry, isProductAvailable } from './country';

// Server Component counterpart of useCountry() (see context/CountryContext.jsx)
// — reads the cookie middleware.ts sets from the incoming request's own
// x-vercel-ip-country header. Used wherever a Server Component needs to gate
// rendering before any client code (and its data fetch) runs at all.
export async function getServerCountry() {
  const store = await cookies();
  const country = store.get(COUNTRY_COOKIE)?.value || null;
  return {
    country,
    currency: getCurrencyForCountry(country),
    productsAvailable: isProductAvailable(country),
  };
}
