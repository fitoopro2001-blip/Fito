import apiClient from './client';

export const fetchCategories = async () => {
    const { data } = await apiClient.get('/admin/categories');
    return data.categories;
};

export const createCategory = async (payload) => {
    const { data } = await apiClient.post('/admin/categories', payload);
    return data.category;
};

export const updateCategory = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/categories/${id}`, payload);
    return data.category;
};

export const deleteCategory = async (id) => {
    await apiClient.delete(`/admin/categories/${id}`);
};
