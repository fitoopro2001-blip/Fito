import PromoCode from '../models/PromoCode.model.js';
import PromoSetting from '../models/PromoSetting.model.js';
import { PROMO_CODE_STATUS } from '../constants/promoCodeStatus.js';
import { randomCode } from './referralCode.util.js';
import { sendPromoCodeEmail } from './mailer.util.js';

const CODE_LENGTH = 6;
const CODE_PREFIX = 'FITO';

// Same self-healing pattern as consultationPlans' ensureGoalHasPlans: the
// singleton is upserted on first read rather than needing a seed step, so a
// fresh database (or a deployment that predates this feature) still gets
// working defaults.
export const getPromoSettings = async () =>
    PromoSetting.findOneAndUpdate(
        { key: 'promo' },
        { $setOnInsert: { key: 'promo' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

const generateUniqueCode = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = `${CODE_PREFIX}-${randomCode(CODE_LENGTH)}`;
        // eslint-disable-next-line no-await-in-loop
        const exists = await PromoCode.exists({ code });
        if (!exists) return code;
    }
    throw new Error('Could not generate a unique promo code');
};

// Flips `active` codes whose expiresAt has passed over to `expired`. Called
// lazily from the read paths (user's own list, admin list) rather than from a
// cron, so the stored status stays truthful without extra infrastructure.
// Scope it with `filter` so a single user's list doesn't sweep the whole
// collection.
export const expireStalePromoCodes = async (filter = {}) =>
    PromoCode.updateMany(
        { ...filter, status: PROMO_CODE_STATUS.ACTIVE, expiresAt: { $lte: new Date() } },
        { $set: { status: PROMO_CODE_STATUS.EXPIRED } }
    );

// Called when a referred signup becomes a real, verified account — that's the
// point the referral is worth rewarding, and it keeps codes from being minted
// for unverified registrations that get discarded (see auth.controller.js).
//
// Returns the created code, or null when there's nothing to issue (no
// referrer, programme disabled, or this signup already earned one). Never
// throws: the caller is in the middle of an auth flow that must not fail
// because a promo email bounced.
export const issueReferralPromoCode = async (referredUser) => {
    try {
        if (!referredUser?.referredBy) return null;

        const settings = await getPromoSettings();
        if (!settings.enabled) return null;

        // `issuedFor` is unique, so this is also the guard against a second
        // OTP verification minting a duplicate code for the same signup.
        if (await PromoCode.exists({ issuedFor: referredUser._id })) return null;

        const expiresAt = new Date(Date.now() + settings.validityDays * 24 * 60 * 60 * 1000);
        const promo = await PromoCode.create({
            code: await generateUniqueCode(),
            owner: referredUser.referredBy,
            issuedFor: referredUser._id,
            discountPercent: settings.discountPercent,
            minOrderTotal: settings.minOrderTotal,
            expiresAt,
        });

        // The owner is a separate document from the signup that triggered
        // this — load it just for the address to mail.
        const owner = await referredUser.constructor.findById(referredUser.referredBy).select('name email');
        if (owner?.email) {
            await sendPromoCodeEmail({
                to: owner.email,
                name: owner.name,
                promo,
                referredName: referredUser.name,
                shareable: settings.shareable,
            });
        }

        return promo;
    } catch (err) {
        // A failed reward must never block the signup/verification it hangs
        // off — log and move on, same as the order-confirmation email.
        console.error('Failed to issue referral promo code:', err.message);
        return null;
    }
};

export const computePromoDiscount = (subtotal, discountPercent) =>
    Math.round(subtotal * (discountPercent / 100) * 100) / 100;

const reject = (status, message) => {
    const err = new Error(message);
    err.statusCode = status;
    throw err;
};

// Shared by the validate endpoint and checkout, so a code that previews as
// valid is accepted on the same terms when the order is actually placed.
// `user` is the requester (undefined for a guest checkout).
export const resolvePromoCode = async ({ code, subtotal, user }) => {
    const normalized = String(code ?? '').trim().toUpperCase();
    if (!normalized) reject(400, 'Enter a promo code');

    const settings = await getPromoSettings();
    const promo = await PromoCode.findOne({ code: normalized });

    // Deliberately the same message for "no such code" and "not yours" — a
    // stranger poking at codes shouldn't learn which ones exist.
    if (!promo) reject(404, 'This promo code is not valid');
    if (promo.status === PROMO_CODE_STATUS.USED) reject(409, 'This promo code has already been used');
    if (promo.status === PROMO_CODE_STATUS.REVOKED) reject(409, 'This promo code is no longer valid');
    // Checks the date rather than the stored status, so a code is unusable
    // the moment it expires — not once the lazy sweep gets to it.
    if (promo.status === PROMO_CODE_STATUS.EXPIRED || promo.expiresAt <= new Date()) {
        reject(410, 'This promo code has expired');
    }

    // 401 rather than 403 for both the guest and the wrong-account case: the
    // order endpoint already uses 403 for its country restriction, and the
    // app tells the two apart by status.
    if (!settings.shareable && String(promo.owner) !== String(user?._id)) {
        reject(401, 'This promo code is only valid on the account it was sent to — please sign in with that account.');
    }

    if (subtotal < promo.minOrderTotal) {
        reject(400, `This promo code needs an order of at least PKR ${promo.minOrderTotal.toFixed(2)}`);
    }

    return { promo, discountAmount: computePromoDiscount(subtotal, promo.discountPercent) };
};

// Marks the code used in a single conditional update, so two checkouts racing
// with the same code can't both win — the loser's matchedCount is 0.
// Returns false when the code was claimed out from under the caller.
export const claimPromoCode = async ({ promo, user, order, discountAmount }) => {
    const { matchedCount } = await PromoCode.updateOne(
        { _id: promo._id, status: PROMO_CODE_STATUS.ACTIVE, expiresAt: { $gt: new Date() } },
        {
            $set: {
                status: PROMO_CODE_STATUS.USED,
                usedAt: new Date(),
                usedByUser: user?._id ?? null,
                usedOnOrder: order?._id ?? null,
                discountAmount,
            },
        }
    );
    return matchedCount === 1;
};

// The claim happens before the order exists (so a lost race can't leave a
// discounted order behind) — this backfills the link once it does.
export const linkPromoToOrder = async (promo, order) =>
    PromoCode.updateOne({ _id: promo._id }, { $set: { usedOnOrder: order._id } });

// Undoes a claim when the order it was claimed for couldn't be created.
export const releasePromoCode = async (promo) =>
    PromoCode.updateOne(
        { _id: promo._id, status: PROMO_CODE_STATUS.USED },
        {
            $set: { status: PROMO_CODE_STATUS.ACTIVE },
            $unset: { usedAt: '', usedByUser: '', usedOnOrder: '', discountAmount: '' },
        }
    );
