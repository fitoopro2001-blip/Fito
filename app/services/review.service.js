import apiClient from './api';

export const getProductReviews = async (productId) => {
    const { data } = await apiClient.get(`/reviews/product/${productId}`);
    return data.reviews;
};

// Auth required — the token is attached by the axios request interceptor.
export const createReview = async ({ productId, rating, comment }) => {
    const { data } = await apiClient.post('/reviews', { productId, rating, comment });
    return data.review;
};

export const updateMyReview = async (id, { rating, comment }) => {
    const { data } = await apiClient.patch(`/reviews/${id}`, { rating, comment });
    return data.review;
};

export const deleteMyReview = async (id) => {
    const { data } = await apiClient.delete(`/reviews/${id}`);
    return data;
};
