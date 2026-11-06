import apiClient from './client';

export const fetchConsultations = async (params = {}) => {
    const { data } = await apiClient.get('/admin/consultations', { params });
    return data;
};

export const fetchConsultation = async (id) => {
    const { data } = await apiClient.get(`/admin/consultations/${id}`);
    return data.consultation;
};

export const updateConsultation = async (id, updates) => {
    const { data } = await apiClient.patch(`/admin/consultations/${id}`, updates);
    return data.consultation;
};

export const sendAdminMessage = async (id, message) => {
    const { data } = await apiClient.post(`/admin/consultations/${id}/messages`, { message });
    return data.consultation;
};

export const deleteConsultation = async (id) => {
    await apiClient.delete(`/admin/consultations/${id}`);
};
