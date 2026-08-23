import express from 'express';
import {
    loginAdmin,
    signupAdmin,
    verifyAdminOtp,
    resendAdminOtp,
    forgotPasswordAdmin,
    resetPasswordAdmin,
    getMeAdmin,
    createAdmin,
    listAdmins,
    updateAdminStatus,
} from '../controllers/adminAuth.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
// Public self-serve signup — always creates an inactive plain admin, see
// signupAdmin. Anyone can call this; login is blocked until the email is
// OTP-verified AND a super admin activates the account.
router.post('/signup', signupAdmin);
router.post('/verify-otp', verifyAdminOtp);
router.post('/resend-otp', resendAdminOtp);
router.post('/forgot-password', forgotPasswordAdmin);
router.post('/reset-password', resetPasswordAdmin);
router.get('/me', protectAdmin, getMeAdmin);
// Only an authenticated super admin can create new admin accounts.
router.post('/create', protectAdmin, requireSuperAdmin, createAdmin);
router.get('/', protectAdmin, requireSuperAdmin, listAdmins);
router.patch('/:id/status', protectAdmin, requireSuperAdmin, updateAdminStatus);

export default router;
