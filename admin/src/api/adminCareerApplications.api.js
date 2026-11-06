import apiClient from './client';

export const fetchCareerApplications = async (params = {}) => {
    const { data } = await apiClient.get('/admin/career-applications', { params });
    return data;
};

export const deleteCareerApplication = async (id) => {
    const { data } = await apiClient.delete(`/admin/career-applications/${id}`);
    return data;
};
