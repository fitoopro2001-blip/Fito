import apiClient from './client';

export const fetchDashboardSummary = async () => {
    const { data } = await apiClient.get('/admin/dashboard/summary');
    return data;
};

export const fetchSalesAnalytics = async (range) => {
    const { data } = await apiClient.get('/admin/dashboard/sales', { params: { range } });
    return data.data;
};
