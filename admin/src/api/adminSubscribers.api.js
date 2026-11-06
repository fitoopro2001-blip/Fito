import apiClient from './client';

export const fetchSubscribers = async (params = {}) => {
    const { data } = await apiClient.get('/admin/subscribers', { params });
    return data;
};

export const deleteSubscriber = async (id) => {
    const { data } = await apiClient.delete(`/admin/subscribers/${id}`);
    return data;
};

// Fans out to every subscriber via Resend batches on the server, which can
// legitimately take a while for a large list — longer timeout than the
// client default, same reasoning as consultation photo uploads.
export const sendBroadcast = async ({ subject, message }) => {
    const { data } = await apiClient.post(
        '/admin/subscribers/broadcast',
        { subject, message },
        { timeout: 60000 }
    );
    return data;
};
