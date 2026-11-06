import asyncHandler from '../utils/asyncHandler.js';
import PromoCode from '../models/PromoCode.model.js';
import { toPublicPromoCode } from '../utils/serializers.js';
import { resolvePromoCode, expireStalePromoCodes, getPromoSettings } from '../utils/promoCode.util.js';

// GET /api/promo-codes/my — the codes this user earned from their referrals.
export const getMyPromoCodes = asyncHandler(async (req, res) => {
    // Scoped to this user so the lazy sweep stays cheap (see expireStalePromoCodes).
    await expireStalePromoCodes({ owner: req.user._id });

    const [promoCodes, settings] = await Promise.all([
        PromoCode.find({ owner: req.user._id })
            .populate('usedOnOrder', 'orderNumber')
            .populate('issuedFor', 'name email')
            .sort({ createdAt: -1 }),
        getPromoSettings(),
    ]);

    res.json({
        promoCodes: promoCodes.map(toPublicPromoCode),
        // The app uses this to word the "share it or not" hint next to the
        // codes — the rule itself is enforced server-side at redemption.
        shareable: settings.shareable,
    });
});

// POST /api/promo-codes/validate { code, subtotal }
// Preview only — nothing is consumed here. Checkout re-resolves the code on
// exactly the same terms (see orders.controller.js), so a code that previews
// as valid can still lose a race to another checkout and be rejected there.
export const validatePromoCode = asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;

    const parsedSubtotal = Number(subtotal);
    if (!Number.isFinite(parsedSubtotal) || parsedSubtotal < 0) {
        res.status(400);
        throw new Error('A valid order subtotal is required');
    }

    const { promo, discountAmount } = await resolvePromoCode({
        code,
        subtotal: parsedSubtotal,
        user: req.user,
    }).catch((err) => {
        res.status(err.statusCode || 400);
        throw err;
    });

    res.json({
        code: promo.code,
        discountPercent: promo.discountPercent,
        discountAmount,
        total: Math.round((parsedSubtotal - discountAmount) * 100) / 100,
        expiresAt: promo.expiresAt,
    });
});
