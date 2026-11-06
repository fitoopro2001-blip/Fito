// `expired` is stored, not just derived — a nightly-ish lazy sweep (see
// promoCode.util.js) flips past-expiry codes over so the admin list and the
// user's "My Promo Codes" panel both read the same field. Every read path
// still treats an `active` code with a past expiresAt as unusable, so a code
// is never redeemable in the window before the sweep catches it.
export const PROMO_CODE_STATUS = Object.freeze({
    ACTIVE: 'active',
    USED: 'used',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
});
