import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import Admin from '../models/Admin.model.js';
import { ROLES } from '../constants/roles.js';
import { ADMIN_STATUS } from '../constants/adminStatus.js';
import { OTP_PURPOSE } from '../constants/otpPurpose.js';
import { issueOtp, checkOtp } from '../utils/otpFlow.util.js';
import { toPublicAdmin } from '../utils/serializers.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';

const OTP_FIELDS = '+otp.codeHash +otp.purpose +otp.expiresAt +otp.attempts';

// POST /api/admin/auth/login
export const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!admin.isEmailVerified) {
        res.status(403);
        throw new Error('Please verify your email before logging in.');
    }

    // Missing status (admins created before this field existed) is treated
    // as active so pre-existing accounts aren't locked out.
    if (admin.status && admin.status !== ADMIN_STATUS.ACTIVE) {
        res.status(403);
        throw new Error('Your account is pending approval by a super admin.');
    }

    res.json({
        token: generateToken({ id: admin._id }),
        admin: toPublicAdmin(admin),
    });
});

// POST /api/admin/auth/signup — public self-serve signup. Always creates a
// plain admin (never super_admin), emails an OTP to verify the address (see
// verifyAdminOtp below), and leaves it inactive until a super admin
// activates it via updateAdminStatus — activation is independent of and in
// addition to email verification.
export const signupAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Name, email and password are required');
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
        if (existing.isEmailVerified) {
            res.status(409);
            throw new Error('An admin with this email already exists');
        }
        // A prior signup attempt never got its OTP verified — most likely the
        // email send itself failed. Let this attempt replace it instead of
        // permanently blocking the address with a 409 it can never clear.
        await existing.deleteOne();
    }

    const admin = await Admin.create({
        name,
        email,
        password,
        role: ROLES.ADMIN,
        status: ADMIN_STATUS.INACTIVE,
        isEmailVerified: false,
    });

    try {
        await issueOtp(admin, OTP_PURPOSE.VERIFY_EMAIL);
    } catch (err) {
        // Don't leave an orphaned, OTP-less admin behind to block the next attempt.
        await admin.deleteOne();
        throw err;
    }

    res.status(201).json({
        admin: toPublicAdmin(admin),
        message: 'We emailed you a verification code. Once verified, a super admin still needs to activate your account before you can log in.',
    });
});

// POST /api/admin/auth/verify-otp
// Confirms the emailed code and marks the address as verified. This alone
// doesn't unlock login — status still needs a super admin's approval.
export const verifyAdminOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and code are required');
    }

    const admin = await Admin.findOne({ email }).select(OTP_FIELDS);
    if (!admin) {
        res.status(404);
        throw new Error('No admin account found with this email');
    }

    try {
        await checkOtp(admin, OTP_PURPOSE.VERIFY_EMAIL, otp);
    } catch (err) {
        res.status(err.statusCode || 400);
        throw err;
    }

    admin.isEmailVerified = true;
    admin.otp = undefined;
    await admin.save();

    res.json({
        message: 'Email verified. A super admin needs to activate your account before you can log in.',
    });
});

// POST /api/admin/auth/resend-otp
// Re-sends the email-verification code for a not-yet-verified admin.
export const resendAdminOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const admin = await Admin.findOne({ email }).select(OTP_FIELDS);
    if (!admin) {
        res.status(404);
        throw new Error('No admin account found with this email');
    }
    if (admin.isEmailVerified) {
        res.status(409);
        throw new Error('This email is already verified');
    }

    try {
        await issueOtp(admin, OTP_PURPOSE.VERIFY_EMAIL);
    } catch (err) {
        res.status(err.statusCode || 500);
        throw err;
    }

    res.json({ message: 'Verification code resent' });
});

// POST /api/admin/auth/forgot-password — self-serve reset, plain admins only.
// Super admins can't use this flow (a compromised inbox shouldn't be able to
// reset the account with the highest privileges); they need another super
// admin's help instead.
export const forgotPasswordAdmin = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const admin = await Admin.findOne({ email }).select(OTP_FIELDS);
    if (!admin) {
        res.status(404);
        throw new Error('No admin account found with this email');
    }
    if (admin.role !== ROLES.ADMIN) {
        res.status(403);
        throw new Error('Super admin passwords can\'t be self-reset. Please contact another super admin.');
    }

    await issueOtp(admin, OTP_PURPOSE.RESET_PASSWORD);

    res.json({ message: 'We emailed you a password reset code.' });
});

// POST /api/admin/auth/reset-password — confirms the OTP and sets the new
// password. Resetting deactivates the account again: the admin has just
// proven control of the inbox, not that they're still an authorized admin,
// so a super admin must re-activate before they can log back in.
export const resetPasswordAdmin = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error('Email, code and new password are required');
    }

    const admin = await Admin.findOne({ email }).select(`+password ${OTP_FIELDS}`);
    if (!admin) {
        res.status(404);
        throw new Error('No admin account found with this email');
    }
    if (admin.role !== ROLES.ADMIN) {
        res.status(403);
        throw new Error('Super admin passwords can\'t be self-reset. Please contact another super admin.');
    }

    try {
        await checkOtp(admin, OTP_PURPOSE.RESET_PASSWORD, otp);
    } catch (err) {
        res.status(err.statusCode || 400);
        throw err;
    }

    admin.password = newPassword;
    admin.otp = undefined;
    admin.status = ADMIN_STATUS.INACTIVE;
    await admin.save();

    res.json({ message: 'Password reset successfully. A super admin needs to reactivate your account before you can log in.' });
});

// GET /api/admin/auth?page=&limit=&search=&status=&role= — super admin only,
// lists all admin accounts.
export const listAdmins = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, role } = req.query;

    const filter = buildSearchFilter(search, ['name', 'email']);
    if (Object.values(ADMIN_STATUS).includes(status)) filter.status = status;
    if (Object.values(ROLES).includes(role)) filter.role = role;

    const [admins, total] = await Promise.all([
        Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Admin.countDocuments(filter),
    ]);
    res.json({ items: admins.map(toPublicAdmin), total, page, limit });
});

// PATCH /api/admin/auth/:id/status — this is how a super admin activates a
// pending self-serve signup (or deactivates an existing admin).
export const updateAdminStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!Object.values(ADMIN_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(ADMIN_STATUS).join(', ')}`);
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    admin.status = status;
    await admin.save();

    res.json({ admin: toPublicAdmin(admin) });
});

// GET /api/admin/auth/me
export const getMeAdmin = asyncHandler(async (req, res) => {
    res.json({ admin: toPublicAdmin(req.admin) });
});

// POST /api/admin/auth/create — super admin only, directly provisions an
// already-usable admin (unlike the public /signup route, which is left
// inactive for a super admin to activate).
export const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Name, email and password are required');
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
        res.status(409);
        throw new Error('An admin with this email already exists');
    }

    const admin = await Admin.create({
        name,
        email,
        password,
        role: Object.values(ROLES).includes(role) ? role : ROLES.ADMIN,
        status: ADMIN_STATUS.ACTIVE,
    });

    res.status(201).json({ admin: toPublicAdmin(admin) });
});
