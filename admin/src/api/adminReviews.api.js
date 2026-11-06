import apiClient from './client';

// Every endpoint here is super-admin only (enforced by the backend router).
export const fetchReviews = async (params = {}) => {
    const { data } = await apiClient.get('/admin/reviews', { params });
    return data;
};

export const addReply = async (reviewId, message) => {
    const { data } = await apiClient.post(`/admin/reviews/${reviewId}/replies`, { message });
    return data.review;
};

export const updateReply = async (reviewId, replyId, message) => {
    const { data } = await apiClient.patch(`/admin/reviews/${reviewId}/replies/${replyId}`, {
        message,
    });
    return data.review;
};

export const deleteReply = async (reviewId, replyId) => {
    const { data } = await apiClient.delete(`/admin/reviews/${reviewId}/replies/${replyId}`);
    return data.review;
};

export const deleteReview = async (reviewId) => {
    const { data } = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return data;
};
