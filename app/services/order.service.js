import apiClient from './api';

export const createOrder = async (orderPayload) => {
  const { data } = await apiClient.post('/orders', orderPayload);
  return data.order;
};

export const getMyOrders = async () => {
  const { data } = await apiClient.get('/orders/my');
  return data.orders;
};

// Public lookup — no auth required. The phone number used at checkout acts
// as the shared secret proving the caller owns the order.
export const trackOrder = async (orderId, phone) => {
  const { data } = await apiClient.get('/orders/track', { params: { orderId, phone } });
  return data.order;
};
