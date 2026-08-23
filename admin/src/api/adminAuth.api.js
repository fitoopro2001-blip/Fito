import apiClient from './client';

export const loginAdmin = async (email, password) => {
    const { data } = await apiClient.post('/admin/auth/login', { email, password });
    return data.admin ? { ...data.admin, token: data.token } : null;
};

export const signupAdmin = async ({ name, email, password }) => {
    const { data } = await apiClient.post('/admin/auth/signup', { name, email, password });
    return data;
};

export const verifyAdminOtp = async ({ email, otp }) => {
    const { data } = await apiClient.post('/admin/auth/verify-otp', { email, otp });
    return data;
};

export const resendAdminOtp = async ({ email }) => {
    const { data } = await apiClient.post('/admin/auth/resend-otp', { email });
    return data;
};

export const forgotPasswordAdmin = async ({ email }) => {
    const { data } = await apiClient.post('/admin/auth/forgot-password', { email });
    return data;
};

export const resetPasswordAdmin = async ({ email, otp, newPassword }) => {
    const { data } = await apiClient.post('/admin/auth/reset-password', { email, otp, newPassword });
    return data;
};

export const fetchAdmins = async (params = {}) => {
    const { data } = await apiClient.get('/admin/auth', { params });
    return data;
};

export const updateAdminStatus = async (id, status) => {
    const { data } = await apiClient.patch(`/admin/auth/${id}/status`, { status });
    return data.admin;
};
