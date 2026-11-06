import asyncHandler from '../utils/asyncHandler.js';
import PromoCode from '../models/PromoCode.model.js';
import User from '../models/User.model.js';
import { PROMO_CODE_STATUS } from '../constants/promoCodeStatus.js';
import { toPublicPromoCode, toPublicPromoSettings } from '../utils/serializers.js';
import { getPromoSettings, expireStalePromoCodes } from '../utils/promoCode.util.js';
import { parsePagination, searchRegex } from '../utils/queryHelpers.js';

const POPULATE_FIELDS = 'name email';

// GET /api/admin/promo-codes/settings
export const getPromoCodeSettings = asyncHandler(async (req, res) => {
    res.json({ settings: toPublicPromoSettings(await getPromoSettings()) });
});

const isPercent = (value) => typeof value === 'number' && value >= 0 && value <= 100;

// PATCH /api/admin/promo-codes/settings
// Changes only affect codes issued from here on — every code snapshots the
// percent/minimum it was issued under (see PromoCode.model.js).
export const updatePromoCodeSettings = asyncHandler(async (req, res) => {
    const { enabled, discountPercent, validityDays, minOrderTotal, shareable } = req.body;

    const settings = await getPromoSettings();

    if (discountPercent !== undefined) {
        if (!isPercent(discountPercent)) {
            res.status(400);
            throw new Error('Discount percent must be between 0 and 100');
        }
        settings.discountPercent = discountPercent;
    }
    if (validityDays !== undefined) {
        if (typeof validityDays !== 'number' || validityDays < 1) {
            res.status(400);
            throw new Error('Validity must be at least 1 day');
        }
        settings.validityDays = validityDays;
    }
    if (minOrderTotal !== undefined) {
        if (typeof minOrderTotal !== 'number' || minOrderTotal < 0) {
            res.status(400);
            throw new Error('Minimum order total must be a non-negative number');
        }
        settings.minOrderTotal = minOrderTotal;
    }
    if (enabled !== undefined) settings.enabled = Boolean(enabled);
    if (shareable !== undefined) settings.shareable = Boolean(shareable);
    settings.updatedByAdmin = req.admin._id;

    await settings.save();
    res.json({ settings: toPublicPromoSettings(settings) });
});

// GET /api/admin/promo-codes?page=&limit=&search=&status=
export const listPromoCodes = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status } = req.query;

    // Keeps stored statuses honest before they're filtered/counted on below.
    await expireStalePromoCodes();

    const filter = {};
    if (Object.values(PROMO_CODE_STATUS).includes(status)) filter.status = status;
    if (search?.trim()) {
        const regex = searchRegex(search);
        // Owner/issuedFor live in a separate collection, so free text has to
        // resolve to user ids first — same approach as adminReferrals.
        const matchingUserIds = await User.find({ $or: [{ name: regex }, { email: regex }] }).distinct('_id');
        filter.$or = [
            { code: regex },
            { owner: { $in: matchingUserIds } },
            { issuedFor: { $in: matchingUserIds } },
        ];
    }

    const [items, total] = await Promise.all([
        PromoCode.find(filter)
            .populate('owner', POPULATE_FIELDS)
            .populate('issuedFor', POPULATE_FIELDS)
            .populate('usedOnOrder', 'orderNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        PromoCode.countDocuments(filter),
    ]);

    res.json({ items: items.map(toPublicPromoCode), total, page, limit });
});

// PATCH /api/admin/promo-codes/:id
// Only ever adjusts an outstanding code — a used one is final, so its record
// of what was actually discounted stays trustworthy.
export const updatePromoCode = asyncHandler(async (req, res) => {
    const { discountPercent, expiresAt, status } = req.body;

    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
        res.status(404);
        throw new Error('Promo code not found');
    }
    if (promo.status === PROMO_CODE_STATUS.USED) {
        res.status(409);
        throw new Error('A redeemed promo code can no longer be edited');
    }

    if (discountPercent !== undefined) {
        if (!isPercent(discountPercent)) {
            res.status(400);
            throw new Error('Discount percent must be between 0 and 100');
        }
        promo.discountPercent = discountPercent;
    }
    if (expiresAt !== undefined) {
        const date = new Date(expiresAt);
        if (Number.isNaN(date.getTime())) {
            res.status(400);
            throw new Error('Expiry must be a valid date');
        }
        promo.expiresAt = date;
        // Extending a lapsed code puts it back in play; the stored status
        // would otherwise stay `expired` and keep blocking redemption.
        if (promo.status === PROMO_CODE_STATUS.EXPIRED && date > new Date()) {
            promo.status = PROMO_CODE_STATUS.ACTIVE;
        }
    }
    if (status !== undefined) {
        // Used/expired aren't admin-settable: the first is earned by a real
        // redemption, the second follows from expiresAt.
        if (![PROMO_CODE_STATUS.ACTIVE, PROMO_CODE_STATUS.REVOKED].includes(status)) {
            res.status(400);
            throw new Error(`Status must be one of: ${PROMO_CODE_STATUS.ACTIVE}, ${PROMO_CODE_STATUS.REVOKED}`);
        }
        if (status === PROMO_CODE_STATUS.ACTIVE && promo.expiresAt <= new Date()) {
            res.status(400);
            throw new Error('Push the expiry date forward before reactivating this code');
        }
        promo.status = status;
    }
    promo.updatedByAdmin = req.admin._id;

    await promo.save();
    await promo.populate([
        { path: 'owner', select: POPULATE_FIELDS },
        { path: 'issuedFor', select: POPULATE_FIELDS },
        { path: 'usedOnOrder', select: 'orderNumber' },
    ]);

    res.json({ promoCode: toPublicPromoCode(promo) });
});
