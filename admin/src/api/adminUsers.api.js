import apiClient from './client';

export const fetchAppUsers = async (params = {}) => {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
};

export const updateAppUserStatus = async (id, status) => {
    const { data } = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return data.user;
};
