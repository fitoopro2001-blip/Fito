import { randomBytes } from 'node:crypto';
import asyncHandler from '../utils/asyncHandler.js';
import QrReferral from '../models/QrReferral.model.js';
import QrReferralScan from '../models/QrReferralScan.model.js';
import {
    DEFAULT_QR_REFERRALS,
    isDefaultQrReferralId,
    isQrReferralId,
} from '../constants/qrReferralIds.js';

const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_NAME_LENGTH = 60;
const MAX_DETAILS_LENGTH = 180;

const readReferralFields = (body, res) => {
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const details = body?.details ?? '';

    if (!name || name.length > MAX_NAME_LENGTH || typeof details !== 'string' || details.length > MAX_DETAILS_LENGTH) {
        res.status(400);
        throw new Error(`Name is required (up to ${MAX_NAME_LENGTH} characters); details must be up to ${MAX_DETAILS_LENGTH} characters`);
    }

    return { name, details: details.trim() };
};

// POST /api/referral-scans
export const recordQrReferralScan = asyncHandler(async (req, res) => {
    const { referralId, eventId } = req.body ?? {};
    if (!isQrReferralId(referralId) || typeof eventId !== 'string' || !EVENT_ID_PATTERN.test(eventId)) {
        res.status(400);
        throw new Error('A valid referralId and eventId are required');
    }

    if (!isDefaultQrReferralId(referralId) && !(await QrReferral.exists({ referralId }))) {
        res.status(400);
        throw new Error('This QR referral does not exist');
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
    const [savedReferrals, rows] = await Promise.all([
        QrReferral.find().sort({ createdAt: 1, _id: 1 }).lean(),
        QrReferralScan.aggregate([
            { $group: { _id: '$referralId', count: { $sum: 1 } } },
        ]),
    ]);
    const savedById = new Map(savedReferrals.map((referral) => [referral.referralId, referral]));
    const counts = new Map(rows.map(({ _id, count }) => [_id, count]));
    const defaults = DEFAULT_QR_REFERRALS.map((referral) => {
        const saved = savedById.get(referral.referralId);
        return {
            referralId: referral.referralId,
            name: saved?.name ?? referral.name,
            details: saved?.details ?? referral.details,
            count: counts.get(referral.referralId) ?? 0,
        };
    });
    const defaultIds = new Set(DEFAULT_QR_REFERRALS.map(({ referralId }) => referralId));
    const custom = savedReferrals
        .filter(({ referralId }) => !defaultIds.has(referralId))
        .map(({ referralId, name, details }) => ({
            referralId,
            name,
            details,
            count: counts.get(referralId) ?? 0,
        }));

    res.json({ items: [...defaults, ...custom] });
});

// POST /api/admin/referral-scans/referrals
export const createQrReferral = asyncHandler(async (req, res) => {
    const { name, details } = readReferralFields(req.body, res);
    const referralId = `qr_${randomBytes(12).toString('hex')}`;
    const referral = await QrReferral.create({ referralId, name, details });

    res.status(201).json({
        item: {
            referralId: referral.referralId,
            name: referral.name,
            details: referral.details,
            count: 0,
        },
    });
});

// PATCH /api/admin/referral-scans/referrals/:referralId
export const updateQrReferral = asyncHandler(async (req, res) => {
    const { referralId } = req.params;
    if (!isQrReferralId(referralId)) {
        res.status(400);
        throw new Error('A valid referralId is required');
    }

    const { name, details } = readReferralFields(req.body, res);
    const update = { $set: { name, details } };
    const isDefault = isDefaultQrReferralId(referralId);
    if (isDefault) update.$setOnInsert = { referralId };

    const referral = await QrReferral.findOneAndUpdate(
        { referralId },
        update,
        { new: true, upsert: isDefault, runValidators: true, setDefaultsOnInsert: true }
    );

    if (!referral) {
        res.status(404);
        throw new Error('QR referral not found');
    }

    res.json({
        item: {
            referralId: referral.referralId,
            name: referral.name,
            details: referral.details,
        },
    });
});
