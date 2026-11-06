import apiClient from './client';

export const fetchConsultationPlans = async (goal) => {
    const { data } = await apiClient.get('/admin/consultation-plans', {
        params: goal ? { goal } : undefined,
    });
    return data.plans;
};

export const createConsultationPlan = async (goal, payload) => {
    const { data } = await apiClient.post('/admin/consultation-plans', { goal, ...payload });
    return data.plan;
};

export const updateConsultationPlan = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/consultation-plans/${id}`, payload);
    return data.plan;
};

export const deleteConsultationPlan = async (id) => {
    await apiClient.delete(`/admin/consultation-plans/${id}`);
};
