import apiClient from './client';

export const fetchQrReferralScanCounts = async () => {
    const { data } = await apiClient.get('/admin/referral-scans');
    return data.items;
};

export const createQrReferral = async (referral) => {
    const { data } = await apiClient.post('/admin/referral-scans/referrals', referral);
    return data.item;
};

export const updateQrReferral = async (referralId, referral) => {
    const { data } = await apiClient.patch(`/admin/referral-scans/referrals/${referralId}`, referral);
    return data.item;
};
