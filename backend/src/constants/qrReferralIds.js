export const QR_REFERRAL_IDS = Object.freeze([
    'logo1',
    'logo2',
    'logo3',
    'logo4',
    'logo5',
]);

export const DEFAULT_QR_REFERRALS = Object.freeze(
    QR_REFERRAL_IDS.map((referralId) => ({
        referralId,
        name: `Logo ${referralId.slice(-1)}`,
        details: '',
    }))
);

export const isDefaultQrReferralId = (value) => QR_REFERRAL_IDS.includes(value);

export const isQrReferralId = (value) =>
    typeof value === 'string' && (isDefaultQrReferralId(value) || /^qr_[a-f0-9]{24}$/.test(value));
