// Shared money formatter for anywhere a multi-currency price is displayed
// (currently just consultations — products are Pakistan-only, so their PKR
// display elsewhere is left as-is).
const LOCALE_BY_CURRENCY = {
  PKR: 'en-PK',
  SAR: 'ar-SA',
  USD: 'en-US',
};

export function formatPrice(amount, currency = 'PKR') {
  const locale = LOCALE_BY_CURRENCY[currency] || 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toLocaleString('en-US')}`;
  }
}
