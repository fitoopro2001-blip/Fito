import apiClient from './client';

// Multipart because the edit modal can attach a proof-of-payment screenshot
// alongside the status/amount/notes fields, mirroring adminProducts.api.js.
const toFormData = ({ proofScreenshot, ...fields }) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (proofScreenshot instanceof File) formData.append('proofScreenshot', proofScreenshot);

    return formData;
};

export const fetchReferralCommissions = async (params = {}) => {
    const { data } = await apiClient.get('/admin/referrals', { params });
    return data;
};

export const fetchReferralCommission = async (id) => {
    const { data } = await apiClient.get(`/admin/referrals/${id}`);
    return data.referral;
};

export const updateReferralCommission = async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/referrals/${id}`, toFormData(payload));
    return data.referral;
};
