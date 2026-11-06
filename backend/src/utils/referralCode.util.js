import crypto from 'node:crypto';
import mongoose from 'mongoose';

// Excludes visually-ambiguous characters (0/O, 1/I) since these are meant to
// be read off a screen and typed or shared verbally.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

// Exported so promo codes (see promoCode.util.js) are drawn from the same
// unambiguous alphabet — both are read off a screen and typed back in.
export const randomCode = (length = CODE_LENGTH) =>
    Array.from(crypto.randomBytes(length))
        .map((byte) => ALPHABET[byte % ALPHABET.length])
        .join('');

// Retries on the rare collision rather than trusting randomness alone, since
// the field is unique-indexed. Looks the User model up lazily via mongoose's
// registry (rather than importing User.model.js directly) to avoid a
// circular import — this module is used from User.model.js's own pre-save hook.
export const generateUniqueReferralCode = async () => {
    const User = mongoose.model('User');
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = randomCode();
        // eslint-disable-next-line no-await-in-loop
        const exists = await User.exists({ referralCode: code });
        if (!exists) return code;
    }
    throw new Error('Could not generate a unique referral code');
};
