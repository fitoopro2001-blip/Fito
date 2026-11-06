// What an OTP was issued for — kept separate from USER_STATUS since an OTP
// can be requested by an already-active user (password reset).
export const OTP_PURPOSE = Object.freeze({
    VERIFY_EMAIL: 'verify_email',
    RESET_PASSWORD: 'reset_password',
});
