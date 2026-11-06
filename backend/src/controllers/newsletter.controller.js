import asyncHandler from '../utils/asyncHandler.js';
import Subscriber from '../models/Subscriber.model.js';
import { EMAIL_REGEX } from '../constants/personalInfo.js';

// POST /api/newsletter — public. Re-subscribing with an already-known email
// is treated as success rather than a conflict, since the visitor's intent
// (be on the list) is already satisfied.
export const subscribe = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
        res.status(400);
        throw new Error('A valid email address is required');
    }

    await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });

    res.status(201).json({ message: 'Subscribed' });
});

// GET /api/newsletter/unsubscribe?email= — clicked straight from an email
// client, so this returns a plain HTML page rather than JSON. Deleting an
// email that was never subscribed is a no-op, not an error, so the link is
// safe to click twice.
export const unsubscribe = asyncHandler(async (req, res) => {
    const email = req.query.email?.trim().toLowerCase();
    if (email) await Subscriber.deleteOne({ email });

    res.type('html').send(`
        <!DOCTYPE html>
        <html>
            <head><meta charset="utf-8" /><title>Unsubscribed — Fito</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
                <h2>You've been unsubscribed</h2>
                <p>${email ?? 'This address'} won't receive any more newsletter emails from Fito.</p>
            </body>
        </html>
    `);
});
