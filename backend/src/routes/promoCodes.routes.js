import express from 'express';
import { getMyPromoCodes, validatePromoCode } from '../controllers/promoCodes.controller.js';
import { protect, attachUserIfPresent } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my', protect, getMyPromoCodes);
// Optional auth to mirror checkout: guests can preview a code, but a
// non-shareable one is only accepted for the account that owns it.
router.post('/validate', attachUserIfPresent, validatePromoCode);

export default router;
