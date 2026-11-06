import asyncHandler from '../utils/asyncHandler.js';
import Subscriber from '../models/Subscriber.model.js';
import { toPublicSubscriber } from '../utils/serializers.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';
import { sendNewsletterBroadcast } from '../utils/mailer.util.js';
import sanitizeRichText from '../utils/sanitizeRichText.js';

// Same allowed set as adminBlogs.controller.js's Tiptap content — the panel's
// editor only ever exposes bold, italic, strike and links.
const sanitizeMessage = (message) => sanitizeRichText(message);

// GET /api/admin/subscribers?page=&limit=&search=
export const listSubscribers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildSearchFilter(req.query.search, ['email']);

    const [subscribers, total] = await Promise.all([
        Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Subscriber.countDocuments(filter),
    ]);
    res.json({ items: subscribers.map(toPublicSubscriber), total, page, limit });
});

// POST /api/admin/subscribers/broadcast — { subject, message } where message
// is HTML from the admin panel's rich text editor.
export const sendBroadcast = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;

    if (!subject?.trim() || !message?.trim()) {
        res.status(400);
        throw new Error('Subject and message are required');
    }

    const subscribers = await Subscriber.find().select('email');
    if (subscribers.length === 0) {
        res.status(400);
        throw new Error('There are no subscribers to send to');
    }

    const { sent, failed } = await sendNewsletterBroadcast({
        emails: subscribers.map((s) => s.email),
        subject: subject.trim(),
        html: sanitizeMessage(message),
    });

    res.json({ sent, failed, total: subscribers.length });
});

// DELETE /api/admin/subscribers/:id
export const deleteSubscriber = asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
        res.status(404);
        throw new Error('Subscriber not found');
    }

    await subscriber.deleteOne();

    res.json({ message: 'Subscriber deleted' });
});
