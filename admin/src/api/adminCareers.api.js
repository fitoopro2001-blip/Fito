import apiClient from './client';

export const fetchCareers = async (params = {}) => {
    const { data } = await apiClient.get('/admin/careers', { params });
    return data;
};

export const createCareer = async (payload) => {
    const { data } = await apiClient.post('/admin/careers', payload);
    return data.career;
};

export const updateCareer = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/careers/${id}`, payload);
    return data.career;
};

export const deleteCareer = async (id) => {
    const { data } = await apiClient.delete(`/admin/careers/${id}`);
    return data;
};
