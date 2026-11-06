import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/Notification.model.js';
import { toPublicNotification } from '../utils/serializers.js';
import { NOTIFICATION_STATUS, NOTIFICATION_AUDIENCE_ALL } from '../constants/notification.js';

// Notifications visible to a logged-in user: sent, due, and broadcast to
// everyone. `protect` on the route guarantees req.user exists here.
const visibleToUser = () => ({
    status: NOTIFICATION_STATUS.SENT,
    audience: NOTIFICATION_AUDIENCE_ALL,
    sendDate: { $lte: new Date() },
});

// GET /api/notifications
export const listMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find(visibleToUser()).sort({ sendDate: -1 });
    const unreadCount = notifications.filter(
        (n) => !n.readBy.some((id) => String(id) === String(req.user._id))
    ).length;

    res.json({
        notifications: notifications.map((n) => toPublicNotification(n, req.user._id)),
        unreadCount,
    });
});

// PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, ...visibleToUser() });
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    await Notification.updateOne(
        { _id: notification._id },
        { $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: 'Marked as read' });
});

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(visibleToUser(), { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'All notifications marked as read' });
});
