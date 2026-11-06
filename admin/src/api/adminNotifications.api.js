import apiClient from './client';

export const fetchNotifications = async (params = {}) => {
    const { data } = await apiClient.get('/admin/notifications', { params });
    return data;
};

export const createNotification = async (payload) => {
    const { data } = await apiClient.post('/admin/notifications', payload);
    return data.notification;
};

export const updateNotification = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/notifications/${id}`, payload);
    return data.notification;
};

export const deleteNotification = async (id) => {
    const { data } = await apiClient.delete(`/admin/notifications/${id}`);
    return data;
};
