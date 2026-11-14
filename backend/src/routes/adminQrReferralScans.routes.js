import express from 'express';
import {
    createQrReferral,
    getQrReferralScanCounts,
    updateQrReferral,
} from '../controllers/qrReferralScans.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

router.use(protectAdmin);
router.get('/', getQrReferralScanCounts);
router.post('/referrals', createQrReferral);
router.patch('/referrals/:referralId', updateQrReferral);

export default router;
