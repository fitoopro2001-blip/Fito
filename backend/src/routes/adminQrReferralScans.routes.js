import express from 'express';
import { getQrReferralScanCounts } from '../controllers/qrReferralScans.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

router.use(protectAdmin);
router.get('/', getQrReferralScanCounts);

export default router;
