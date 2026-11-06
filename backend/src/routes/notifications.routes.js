import express from 'express';
import {
    listMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '../controllers/notifications.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Login required — notifications are only ever shown to signed-in users.
router.use(protect);

router.get('/', listMyNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

export default router;
