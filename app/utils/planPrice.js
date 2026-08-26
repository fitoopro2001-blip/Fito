// Picks a consultation plan's price for the visitor's currency. Mirrors the
// backend's resolveConsultationPrice() (backend/src/controllers/consultations.controller.js)
// so what's shown before checkout matches what's actually charged.
//
// Falls back to PKR when the resolved currency isn't PKR but an admin hasn't
// entered that currency's price yet (still 0/undefined) — this is a "not yet
// configured" safety net, never an exchange-rate conversion.
export function resolvePlanPrice(plan, currency) {
  if (currency === 'SAR' && plan.priceSAR > 0) {
    return {
      currency: 'SAR',
      price: plan.priceSAR,
      discountedPrice: plan.discountedPriceSAR ?? plan.priceSAR,
    };
  }
  if (currency === 'USD' && plan.priceUSD > 0) {
    return {
      currency: 'USD',
      price: plan.priceUSD,
      discountedPrice: plan.discountedPriceUSD ?? plan.priceUSD,
    };
  }
  return {
    currency: 'PKR',
    price: plan.price,
    discountedPrice: plan.discountedPrice ?? plan.price,
  };
}
