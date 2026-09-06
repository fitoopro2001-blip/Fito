import apiClient from './api';

// The codes this account earned from its referrals. Also returns `shareable`,
// which only controls the wording shown next to them.
export const getMyPromoCodes = async () => {
  const { data } = await apiClient.get('/promo-codes/my');
  return data;
};

// Preview a code against a subtotal. Nothing is consumed here — checkout
// re-checks the code when the order is actually placed.
export const validatePromoCode = async (code, subtotal) => {
  const { data } = await apiClient.post('/promo-codes/validate', { code, subtotal });
  return data;
};
