import express from 'express';
import { getMyReferralSummary } from '../controllers/referrals.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyReferralSummary);

export default router;
