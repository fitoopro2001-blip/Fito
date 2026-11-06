import express from 'express';
import { listOrders, updateOrderStatus } from '../controllers/adminOrders.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Order management is super-admin-only, matching the /orders route gating
// already in the admin panel.
router.use(protectAdmin, requireSuperAdmin);

router.get('/', listOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
