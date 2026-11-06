import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ReferralCommission from '../models/ReferralCommission.model.js';
import User from '../models/User.model.js';
import { COMMISSION_STATUS } from '../constants/commissionStatus.js';
import { toPublicReferralCommission } from '../utils/serializers.js';
import { parsePagination, searchRegex } from '../utils/queryHelpers.js';
import { toImageUrl } from '../middleware/upload.middleware.js';

const POPULATE_FIELDS = 'name email createdAt';

const findCommissionOr404 = async (id) => {
    const commission = await ReferralCommission.findById(id);
    if (!commission) {
        const err = new Error('Referral commission record not found');
        err.statusCode = 404;
        throw err;
    }
    return commission;
};

// GET /api/admin/referrals?page=&limit=&search=&status=
export const listReferralCommissions = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status } = req.query;

    const filter = {};
    if (Object.values(COMMISSION_STATUS).includes(status)) filter.status = status;
    if (search?.trim()) {
        // Referrer/referredUser are separate User docs, so the search has to
        // resolve to a set of matching user ids first rather than a single $or.
        const matchingUserIds = await User.find({
            $or: [{ name: searchRegex(search) }, { email: searchRegex(search) }],
        }).distinct('_id');
        filter.$or = [{ referrer: { $in: matchingUserIds } }, { referredUser: { $in: matchingUserIds } }];
    }

    const [items, total] = await Promise.all([
        ReferralCommission.find(filter)
            .populate('referrer', POPULATE_FIELDS)
            .populate('referredUser', POPULATE_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        ReferralCommission.countDocuments(filter),
    ]);

    res.json({ items: items.map(toPublicReferralCommission), total, page, limit });
});

// GET /api/admin/referrals/:id
export const getReferralCommissionById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(404);
        throw new Error('Referral commission record not found');
    }

    const commission = await findCommissionOr404(req.params.id)
        .then((doc) => doc.populate([{ path: 'referrer', select: POPULATE_FIELDS }, { path: 'referredUser', select: POPULATE_FIELDS }]))
        .catch((err) => {
            res.status(err.statusCode || 404);
            throw err;
        });

    res.json({ referral: toPublicReferralCommission(commission) });
});

// PATCH /api/admin/referrals/:id (multipart — optional proofScreenshot file)
export const updateReferralCommission = asyncHandler(async (req, res) => {
    const { status, amount, notes } = req.body;

    if (status && !Object.values(COMMISSION_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(COMMISSION_STATUS).join(', ')}`);
    }

    const commission = await findCommissionOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    if (status !== undefined) {
        // Only stamp sentAt the first time it moves to SENT — a later edit
        // (e.g. correcting the amount) shouldn't push the payment date forward.
        if (status === COMMISSION_STATUS.SENT && !commission.sentAt) {
            commission.sentAt = new Date();
        }
        if (status === COMMISSION_STATUS.PENDING) {
            commission.sentAt = null;
        }
        commission.status = status;
    }
    if (amount !== undefined && amount !== '') commission.amount = Number(amount);
    if (notes !== undefined) commission.notes = notes;
    if (req.file) commission.proofScreenshot = toImageUrl(req.file);
    commission.updatedByAdmin = req.admin._id;

    await commission.save();
    await commission.populate([{ path: 'referrer', select: POPULATE_FIELDS }, { path: 'referredUser', select: POPULATE_FIELDS }]);

    res.json({ referral: toPublicReferralCommission(commission) });
});
