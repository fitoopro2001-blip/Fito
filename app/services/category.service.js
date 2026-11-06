import apiClient from './api';

export const getCategories = async () => {
    const { data } = await apiClient.get('/categories');
    return data.categories;
};
