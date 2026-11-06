import apiClient from './api';

export const registerUser = async ({ name, email, password, phone, referralCode }) => {
  const { data } = await apiClient.post('/auth/register', { name, email, password, phone, referralCode });
  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.user;
};

export const verifyOtp = async ({ email, otp }) => {
  const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
  return data;
};

export const resendOtp = async ({ email }) => {
  const { data } = await apiClient.post('/auth/resend-otp', { email });
  return data;
};

export const forgotPassword = async ({ email }) => {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const { data } = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
  return data;
};

export const googleAuth = async ({ credential, referralCode }) => {
  const { data } = await apiClient.post('/auth/google', { credential, referralCode });
  return data;
};
