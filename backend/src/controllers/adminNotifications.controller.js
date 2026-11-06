import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/Notification.model.js';
import { toPublicNotification } from '../utils/serializers.js';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '../constants/notification.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';

// GET /api/admin/notifications?page=&limit=&search=&type=&status= — includes
// drafts and scheduled.
export const listNotifications = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, type, status } = req.query;

    const filter = buildSearchFilter(search, ['title', 'message']);
    if (Object.values(NOTIFICATION_TYPE).includes(type)) filter.type = type;
    if (Object.values(NOTIFICATION_STATUS).includes(status)) filter.status = status;

    const [notifications, total] = await Promise.all([
        Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments(filter),
    ]);
    res.json({ items: notifications.map((n) => toPublicNotification(n)), total, page, limit });
});

// POST /api/admin/notifications
export const createNotification = asyncHandler(async (req, res) => {
    const { title, message, type, audience, status, date } = req.body;

    if (!title?.trim() || !message?.trim() || !date) {
        res.status(400);
        throw new Error('Title, message and send date are required');
    }
    if (type && !Object.values(NOTIFICATION_TYPE).includes(type)) {
        res.status(400);
        throw new Error(`Type must be one of: ${Object.values(NOTIFICATION_TYPE).join(', ')}`);
    }
    if (status && !Object.values(NOTIFICATION_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(NOTIFICATION_STATUS).join(', ')}`);
    }

    const notification = await Notification.create({
        title: title.trim(),
        message: message.trim(),
        type,
        audience,
        status,
        sendDate: new Date(date),
        createdBy: req.admin._id,
    });

    res.status(201).json({ notification: toPublicNotification(notification) });
});

// PATCH /api/admin/notifications/:id
export const updateNotification = asyncHandler(async (req, res) => {
    const { title, message, type, audience, status, date } = req.body;

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (type && !Object.values(NOTIFICATION_TYPE).includes(type)) {
        res.status(400);
        throw new Error(`Type must be one of: ${Object.values(NOTIFICATION_TYPE).join(', ')}`);
    }
    if (status && !Object.values(NOTIFICATION_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(NOTIFICATION_STATUS).join(', ')}`);
    }

    if (title !== undefined) notification.title = title.trim();
    if (message !== undefined) notification.message = message.trim();
    if (type !== undefined) notification.type = type;
    if (audience !== undefined) notification.audience = audience;
    if (status !== undefined) notification.status = status;
    if (date) notification.sendDate = new Date(date);

    await notification.save();

    res.json({ notification: toPublicNotification(notification) });
});

// DELETE /api/admin/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    await notification.deleteOne();

    res.json({ message: 'Notification deleted' });
});
