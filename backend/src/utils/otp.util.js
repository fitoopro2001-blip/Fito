import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between resends
export const OTP_MAX_ATTEMPTS = 5;

// 6-digit numeric code, zero-padded (crypto.randomInt is uniform, unlike Math.random).
export const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const hashOtp = (otp) => bcrypt.hash(otp, 10);

export const compareOtp = (candidate, hash) => bcrypt.compare(candidate, hash);
