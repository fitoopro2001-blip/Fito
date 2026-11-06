import express from 'express';
import { getDashboardSummary, getSalesAnalytics } from '../controllers/adminDashboard.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can view the dashboard, matching the / route gating in the admin panel.
router.use(protectAdmin);

router.get('/summary', getDashboardSummary);
router.get('/sales', getSalesAnalytics);

export default router;
