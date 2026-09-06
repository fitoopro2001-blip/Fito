import mongoose from 'mongoose';
import { PROMO_CODE_STATUS } from '../constants/promoCodeStatus.js';

// A single-use discount code issued to a referrer when someone they referred
// verifies their account (see promoCode.util.js#issueReferralPromoCode).
// One code per referred signup — refer three people, get three codes.
const promoCodeSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
        // The referrer — the person who earned this code and (unless promo
        // settings allow sharing) the only account that may redeem it.
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        // The referred signup that earned it. Unique so a re-run of the issue
        // path (e.g. a second OTP verification) can't mint a duplicate.
        issuedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
        // Snapshotted from PromoSetting at issue time so changing the global
        // percent later never re-prices codes already in customers' inboxes.
        discountPercent: { type: Number, required: true, min: 0, max: 100 },
        // Also snapshotted — a code issued under "min order 2000" keeps that
        // floor even if the setting is lowered afterwards.
        minOrderTotal: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: Object.values(PROMO_CODE_STATUS),
            default: PROMO_CODE_STATUS.ACTIVE,
            index: true,
        },
        expiresAt: { type: Date, required: true, index: true },
        // Set together when the code is redeemed at checkout.
        usedAt: { type: Date, default: null },
        usedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        usedOnOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
        // Currency amount actually taken off the order it was redeemed on.
        discountAmount: { type: Number, default: null },
        updatedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

export default mongoose.model('PromoCode', promoCodeSchema);
