import { generateOtp, hashOtp, compareOtp, OTP_TTL_MS, OTP_RESEND_COOLDOWN_MS, OTP_MAX_ATTEMPTS } from './otp.util.js';
import { sendOtpEmail } from './mailer.util.js';

// Generates a fresh OTP, stores its hash on the doc, and emails it. Shared by
// User and Admin registration/verification flows so they go through one
// cooldown/expiry/attempt-reset path. `doc` just needs an `email`, an `otp`
// subdocument path, and `.save()` — both models satisfy that.
export const issueOtp = async (doc, purpose) => {
    const issuedAt = doc.otp?.expiresAt ? doc.otp.expiresAt.getTime() - OTP_TTL_MS : 0;
    if (Date.now() - issuedAt < OTP_RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - issuedAt)) / 1000);
        const err = new Error(`Please wait ${waitSeconds}s before requesting another code`);
        err.statusCode = 429;
        throw err;
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);

    // Send before persisting: if delivery fails, we don't want a stored code
    // the recipient never received — that would also wrongly trip the
    // cooldown above on their very next (immediate) retry.
    await sendOtpEmail({ to: doc.email, otp, purpose });

    doc.otp = {
        codeHash,
        purpose,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        attempts: 0,
    };
    await doc.save();
};

// Validates a submitted OTP against the stored hash for the given purpose,
// tracking failed attempts. Throws with an appropriate status on failure.
export const checkOtp = async (doc, purpose, submittedOtp) => {
    if (!doc.otp?.codeHash || doc.otp.purpose !== purpose) {
        const err = new Error('No pending verification code for this account. Please request a new one.');
        err.statusCode = 400;
        throw err;
    }

    if (doc.otp.expiresAt < new Date()) {
        const err = new Error('This code has expired. Please request a new one.');
        err.statusCode = 400;
        throw err;
    }

    if (doc.otp.attempts >= OTP_MAX_ATTEMPTS) {
        const err = new Error('Too many incorrect attempts. Please request a new code.');
        err.statusCode = 429;
        throw err;
    }

    const isMatch = await compareOtp(submittedOtp, doc.otp.codeHash);
    if (!isMatch) {
        doc.otp.attempts += 1;
        await doc.save();
        const err = new Error('Invalid code. Please try again.');
        err.statusCode = 400;
        throw err;
    }
};
