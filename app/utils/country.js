// Single source of truth for country -> currency/availability on the
// frontend. Mirrors backend/src/utils/geo.util.js — kept in sync manually
// since these are two separate deployments/packages.
export const COUNTRY_COOKIE = 'fito_country';

// PK -> PKR, SA -> SAR, everything else (including a failed/missing
// detection) -> USD.
export const FALLBACK_CURRENCY = 'USD';

export const getCurrencyForCountry = (country) => {
  if (country === 'PK') return 'PKR';
  if (country === 'SA') return 'SAR';
  return FALLBACK_CURRENCY;
};

// Physical products only ship within Pakistan; consultations have no such
// restriction.
export const isProductAvailable = (country) => country === 'PK';
