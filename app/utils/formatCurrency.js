// Shared money formatter for anywhere a multi-currency price is displayed
// (currently just consultations — products are Pakistan-only, so their PKR
// display elsewhere is left as-is).
//
// Always formatted in the `en-US` locale with the ISO currency code as the
// prefix (e.g. "SAR 1,000") rather than a locale-specific symbol/numeral
// system — using SAR's own locale (`ar-SA`) would render Arabic-Indic
// digits and RTL currency placement, which isn't what this English-language
// UI wants.
export function formatPrice(amount, currency = 'PKR') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toLocaleString('en-US')}`;
  }
}
