// Keep in sync with the GENDERS/ACTIVITY_LEVELS options in
// app/utils/consultationValidation.js's Yup schema — the frontend blocks
// submission on the same values, so a mismatch here would either reject
// something the form already accepted, or silently accept something the
// form never offers.
export const GENDERS = Object.freeze(['male', 'female', 'other']);
export const ACTIVITY_LEVELS = Object.freeze(['sedentary', 'light', 'moderate', 'active']);

// Same shape as the PHONE_REGEX in app/utils/consultationValidation.js.
export const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
