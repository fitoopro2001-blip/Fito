import apiClient from './api';

// Auth required — the token is attached by the axios request interceptor.
export const getMyNotifications = async () => {
    const { data } = await apiClient.get('/notifications');
    return data;
};

export const markNotificationRead = async (id) => {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return data;
};

export const markAllNotificationsRead = async () => {
    const { data } = await apiClient.patch('/notifications/read-all');
    return data;
};
