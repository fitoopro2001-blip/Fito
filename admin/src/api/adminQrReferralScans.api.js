import apiClient from './client';

export const fetchQrReferralScanCounts = async () => {
    const { data } = await apiClient.get('/admin/referral-scans');
    return data.items;
};
