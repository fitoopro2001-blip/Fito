import express from 'express';
import {
    getPromoCodeSettings,
    updatePromoCodeSettings,
    listPromoCodes,
    updatePromoCode,
} from '../controllers/adminPromoCodes.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Promo codes are money off orders — super-admin-only, matching /referrals.
router.use(protectAdmin, requireSuperAdmin);

// Registered before /:id so "settings" is never read as an id.
router.get('/settings', getPromoCodeSettings);
router.patch('/settings', updatePromoCodeSettings);

router.get('/', listPromoCodes);
router.patch('/:id', updatePromoCode);

export default router;
