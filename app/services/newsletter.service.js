import apiClient from './api';

// Public — no auth. Backend treats re-subscribing with a known email as
// success rather than a conflict.
export const subscribeNewsletter = async (email) => {
  const { data } = await apiClient.post('/newsletter', { email });
  return data;
};
