import apiClient from './api';

export const getProducts = async ({ category, search, sort } = {}) => {
    const { data } = await apiClient.get('/products', {
        params: { category, search, sort },
    });
    return data.products;
};

export const getProduct = async (id) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data.product;
};
