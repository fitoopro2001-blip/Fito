import express from 'express';
import { createPosOrder, listOrders, updateOrderStatus } from '../controllers/adminOrders.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Order management is super-admin-only, matching the /orders route gating
// already in the admin panel.
router.use(protectAdmin, requireSuperAdmin);

router.get('/', listOrders);
router.post('/pos', createPosOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
