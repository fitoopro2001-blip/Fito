import express from 'express';
import {
    listNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
} from '../controllers/adminNotifications.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can manage notifications, matching the /blogs route gating.
router.use(protectAdmin);

router.get('/', listNotifications);
router.post('/', createNotification);
router.patch('/:id', updateNotification);
router.delete('/:id', deleteNotification);

export default router;
