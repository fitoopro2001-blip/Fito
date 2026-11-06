import apiClient from './client';

export const fetchOrders = async (params = {}) => {
    const { data } = await apiClient.get('/admin/orders', { params });
    return data;
};

export const updateOrderStatus = async (id, status) => {
    const { data } = await apiClient.patch(`/admin/orders/${id}/status`, { status });
    return data.order;
};
