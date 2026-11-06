import apiClient from './api';

export const getMyReferralSummary = async () => {
  const { data } = await apiClient.get('/referrals/my');
  return data;
};
