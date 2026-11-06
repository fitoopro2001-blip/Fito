import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    googleAuth,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

export default router;
