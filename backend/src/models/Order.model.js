import mongoose from 'mongoose';
import crypto from 'crypto';
import { ORDER_STATUS } from '../constants/orderStatus.js';

// `user` is optional — checkout doesn't require login (guest checkout), so
// orders placed while signed in are linked to the account but guest orders
// are still accepted.
const orderSchema = new mongoose.Schema(
    {
        // Human-friendly identifier shown to customers (order confirmation,
        // email, track-order lookup) — the raw Mongo _id is neither easy to
        // read nor to type back in.
        orderNumber: { type: String, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        items: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
        // Line-item sum before any promo discount. `total` is what's actually
        // charged (subtotal - discountAmount), so summing `total` across
        // orders still reports revenue correctly.
        subtotal: { type: Number, min: 0 },
        discountAmount: { type: Number, default: 0, min: 0 },
        // Snapshot of the redeemed code — kept on the order so the amount can
        // be explained later even if the PromoCode doc is edited or removed.
        promoCode: {
            code: { type: String, uppercase: true, trim: true },
            discountPercent: { type: Number, min: 0, max: 100 },
            promo: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
        },
        total: { type: Number, required: true, min: 0 },
        paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
        transactionId: { type: String, trim: true },
        screenshotAttached: { type: Boolean, default: false },
        shipping: {
            name: { type: String, required: true, trim: true },
            // Optional — collected alongside phone so a customer can get an
            // order confirmation email, but checkout doesn't require it.
            email: { type: String, trim: true, lowercase: true },
            phone: { type: String, required: true, trim: true },
            address: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PROCESSING,
        },
    },
    { timestamps: true }
);

// Generated pre-validate (rather than a static default) so it can check
// uniqueness against the collection — collisions are extremely unlikely
// given the random space, but the retry loop guards against them anyway.
orderSchema.pre('validate', async function generateOrderNumber() {
    if (this.orderNumber) return;

    let candidate;
    let exists = true;
    while (exists) {
        candidate = `FT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        exists = await this.constructor.exists({ orderNumber: candidate });
    }
    this.orderNumber = candidate;
});

export default mongoose.model('Order', orderSchema);
