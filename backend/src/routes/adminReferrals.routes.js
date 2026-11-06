import express from 'express';
import {
    listReferralCommissions,
    getReferralCommissionById,
    updateReferralCommission,
} from '../controllers/adminReferrals.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';
import { uploadCommissionProof } from '../middleware/upload.middleware.js';

const router = express.Router();

// Commission tracking is financial data — super-admin-only, matching /users.
router.use(protectAdmin, requireSuperAdmin);

router.get('/', listReferralCommissions);
router.get('/:id', getReferralCommissionById);
router.patch('/:id', uploadCommissionProof, updateReferralCommission);

export default router;
