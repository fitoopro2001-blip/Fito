import { OAuth2Client } from 'google-auth-library';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.model.js';
import { USER_STATUS } from '../constants/userStatus.js';
import { OTP_PURPOSE } from '../constants/otpPurpose.js';
import { issueOtp, checkOtp } from '../utils/otpFlow.util.js';
import { toPublicUser } from '../utils/serializers.js';
import { issueReferralPromoCode } from '../utils/promoCode.util.js';

const OTP_FIELDS = '+otp.codeHash +otp.purpose +otp.expiresAt +otp.attempts';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
// New signups start as USER_STATUS.INACTIVE (schema default) and get an OTP
// emailed to verify ownership of the address; verifying it (see verifyOtp)
// activates the account, so no token is issued here yet.
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Name, email and password are required');
    }

    const existing = await User.findOne({ email });
    if (existing) {
        if (existing.isEmailVerified) {
            res.status(409);
            throw new Error('An account with this email already exists');
        }
        // A prior signup attempt never got its OTP verified — most likely the
        // email send itself failed. Let this attempt replace it instead of
        // permanently blocking the address with a 409 it can never clear.
        await existing.deleteOne();
    }

    // An unknown/mistyped code is ignored rather than rejected — a typo
    // shouldn't be able to block someone from signing up.
    const referrer = referralCode?.trim()
        ? await User.findOne({ referralCode: referralCode.trim().toUpperCase() })
        : null;

    const user = await User.create({ name, email, password, phone, referredBy: referrer?._id ?? null });
    try {
        await issueOtp(user, OTP_PURPOSE.VERIFY_EMAIL);
    } catch (err) {
        // Don't leave an orphaned, OTP-less user behind to block the next attempt.
        await user.deleteOne();
        throw err;
    }

    res.status(201).json({
        user: toPublicUser(user),
        message: 'Registration successful. We emailed you a verification code.',
    });
});

// POST /api/auth/verify-otp
// Confirms the emailed code, activates the account, and logs the user in.
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and code are required');
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) {
        res.status(404);
        throw new Error('No account found with this email');
    }

    try {
        await checkOtp(user, OTP_PURPOSE.VERIFY_EMAIL, otp);
    } catch (err) {
        res.status(err.statusCode || 400);
        throw err;
    }

    user.isEmailVerified = true;
    // Don't let verifying an OTP silently undo an admin's block.
    if (user.status !== USER_STATUS.BLOCKED) {
        user.status = USER_STATUS.ACTIVE;
    }
    user.otp = undefined;
    await user.save();

    if (user.status === USER_STATUS.BLOCKED) {
        res.status(403);
        throw new Error('Your account has been blocked. Please contact support.');
    }

    // Rewards the referrer here rather than at registration: an unverified
    // signup can still be discarded and replaced (see registerUser), so this
    // is the first point the referral represents a real account. Never
    // throws — see issueReferralPromoCode.
    await issueReferralPromoCode(user);

    res.json({
        token: generateToken({ id: user._id }),
        user: toPublicUser(user),
    });
});

// POST /api/auth/resend-otp
// Re-sends the email-verification code for a not-yet-verified account.
export const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) {
        res.status(404);
        throw new Error('No account found with this email');
    }
    if (user.isEmailVerified) {
        res.status(409);
        throw new Error('This email is already verified');
    }

    try {
        await issueOtp(user, OTP_PURPOSE.VERIFY_EMAIL);
    } catch (err) {
        res.status(err.statusCode || 500);
        throw err;
    }

    res.json({ message: 'Verification code resent' });
});

// POST /api/auth/forgot-password
// Always responds with the same message whether or not the account exists,
// so this endpoint can't be used to enumerate registered emails.
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (user) {
        await issueOtp(user, OTP_PURPOSE.RESET_PASSWORD);
    }

    res.json({ message: 'If an account with that email exists, a reset code has been sent.' });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error('Email, code and new password are required');
    }

    const user = await User.findOne({ email }).select(`+password ${OTP_FIELDS}`);
    if (!user) {
        res.status(404);
        throw new Error('No account found with this email');
    }

    try {
        await checkOtp(user, OTP_PURPOSE.RESET_PASSWORD, otp);
    } catch (err) {
        res.status(err.statusCode || 400);
        throw err;
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
});

// POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
        res.status(401);
        throw new Error('Invalid email or password');
    }
    if (!(await user.comparePassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (user.status === USER_STATUS.BLOCKED) {
        res.status(403);
        throw new Error('Your account has been blocked. Please contact support.');
    }

    if (user.status !== USER_STATUS.ACTIVE) {
        res.status(403);
        throw new Error('Please verify your email to activate your account.');
    }

    res.json({
        token: generateToken({ id: user._id }),
        user: toPublicUser(user),
    });
});

// POST /api/auth/google
// Verifies the ID token from Google's "Sign in with Google" button. Google
// has already confirmed the email, so this activates the account (or links
// googleId onto an existing email/password account) with no OTP step.
export const googleAuth = asyncHandler(async (req, res) => {
    const { credential, referralCode } = req.body;
    if (!credential) {
        res.status(400);
        throw new Error('Missing Google credential');
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        res.status(401);
        throw new Error('Invalid Google credential');
    }

    if (!payload.email_verified) {
        res.status(403);
        throw new Error('Your Google account email is not verified');
    }

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
        user = await User.findOne({ email: payload.email });
        if (user) {
            user.googleId = payload.sub;
            user.isEmailVerified = true;
            // Don't let linking a Google account silently undo an admin's block.
            if (user.status !== USER_STATUS.BLOCKED) {
                user.status = USER_STATUS.ACTIVE;
            }
            await user.save();
        } else {
            // Referral only applies to a brand-new account, not to linking/
            // logging into an existing one via the branches above.
            const referrer = referralCode?.trim()
                ? await User.findOne({ referralCode: referralCode.trim().toUpperCase() })
                : null;

            user = await User.create({
                // Use the first 5 letters of the email's local part rather than
                // Google's display name so app-user names stay consistent/scannable
                // in the admin panel.
                name: payload.email.split('@')[0].slice(0, 5),
                email: payload.email,
                googleId: payload.sub,
                isEmailVerified: true,
                status: USER_STATUS.ACTIVE,
                referredBy: referrer?._id ?? null,
            });

            // Google has already verified the email, so unlike the OTP flow
            // the account is real the moment it's created — reward the
            // referrer right here.
            await issueReferralPromoCode(user);
        }
    }

    if (user.status === USER_STATUS.BLOCKED) {
        res.status(403);
        throw new Error('Your account has been blocked. Please contact support.');
    }

    res.json({
        token: generateToken({ id: user._id }),
        user: toPublicUser(user),
    });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
    res.json({ user: toPublicUser(req.user) });
});
