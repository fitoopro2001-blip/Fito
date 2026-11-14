import asyncHandler from '../utils/asyncHandler.js';
import QrReferralScan from '../models/QrReferralScan.model.js';
import { QR_REFERRAL_IDS, isQrReferralId } from '../constants/qrReferralIds.js';

const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// POST /api/referral-scans
export const recordQrReferralScan = asyncHandler(async (req, res) => {
    const { referralId, eventId } = req.body ?? {};
    if (!isQrReferralId(referralId) || typeof eventId !== 'string' || !EVENT_ID_PATTERN.test(eventId)) {
        res.status(400);
        throw new Error('A valid referralId and eventId are required');
    }

    await QrReferralScan.updateOne(
        { eventId },
        { $setOnInsert: { eventId, referralId } },
        { upsert: true }
    );

    res.status(202).json({ recorded: true });
});

// GET /api/admin/referral-scans
export const getQrReferralScanCounts = asyncHandler(async (req, res) => {
    const rows = await QrReferralScan.aggregate([
        { $group: { _id: '$referralId', count: { $sum: 1 } } },
    ]);
    const counts = new Map(rows.map(({ _id, count }) => [_id, count]));

    res.json({
        items: QR_REFERRAL_IDS.map((referralId) => ({
            referralId,
            count: counts.get(referralId) ?? 0,
        })),
    });
});
