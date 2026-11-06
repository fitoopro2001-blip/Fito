import apiClient from './client';

export const fetchPromoSettings = async () => {
    const { data } = await apiClient.get('/admin/promo-codes/settings');
    return data.settings;
};

export const updatePromoSettings = async (payload) => {
    const { data } = await apiClient.patch('/admin/promo-codes/settings', payload);
    return data.settings;
};

export const fetchPromoCodes = async (params = {}) => {
    const { data } = await apiClient.get('/admin/promo-codes', { params });
    return data;
};

export const updatePromoCode = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/promo-codes/${id}`, payload);
    return data.promoCode;
};
