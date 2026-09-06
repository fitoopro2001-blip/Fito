import mongoose from 'mongoose';

// Singleton config for the referral promo-code programme, edited from the
// admin panel. Enforced as a singleton by the fixed `key` — see
// promoCode.util.js#getPromoSettings, which upserts the one document.
const promoSettingSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'promo', unique: true, immutable: true },
        // Turning this off stops new codes being issued; codes already out
        // there stay redeemable until they're used or expire.
        enabled: { type: Boolean, default: true },
        // Applied to the order subtotal. Snapshotted onto each code at issue.
        discountPercent: { type: Number, default: 10, min: 0, max: 100 },
        // How long a newly issued code stays redeemable.
        validityDays: { type: Number, default: 30, min: 1 },
        // Orders below this subtotal can't use a promo code (0 = no floor).
        minOrderTotal: { type: Number, default: 0, min: 0 },
        // false (the recommended default) binds every code to the account it
        // was issued to — redeeming requires being logged in as that user.
        // Flip it on to let codes be passed to friends/guest checkouts.
        shareable: { type: Boolean, default: false },
        updatedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

export default mongoose.model('PromoSetting', promoSettingSchema);
