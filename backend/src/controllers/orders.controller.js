import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.model.js';
import ReferralCommission from '../models/ReferralCommission.model.js';
import { toPublicOrder } from '../utils/serializers.js';
import { sendOrderConfirmationEmail } from '../utils/mailer.util.js';

// Digits only, so "0300-1234567" and "+92 300 1234567" both match what was
// stored at checkout.
const normalizePhone = (phone) => String(phone ?? '').replace(/\D/g, '');

// POST /api/orders — accepts guest checkout; if a valid token is attached
// (see attachUserIfPresent), the order is linked to that account.
export const createOrder = asyncHandler(async (req, res) => {
    const { items, total, paymentMethod, transactionId, screenshotAttached, shipping } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error('Order must contain at least one item');
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city) {
        res.status(400);
        throw new Error('Shipping name, phone, address and city are required');
    }
    if (!['cod', 'online'].includes(paymentMethod)) {
        res.status(400);
        throw new Error('Payment method must be cod or online');
    }

    const order = await Order.create({
        user: req.user?._id,
        items,
        total,
        paymentMethod,
        transactionId,
        screenshotAttached,
        shipping,
    });

    // First order from a referred, logged-in user creates (or updates) their
    // (single) commission record — mirrors the consultation-booked trigger in
    // consultations.controller.js. Guest checkouts (no req.user) have no
    // referredBy to check against, so they're simply skipped. triggeringOrder
    // is backfilled separately (only if unset) rather than via $setOnInsert,
    // since the consultation-triggered path may have created this doc first.
    if (req.user?.referredBy) {
        await ReferralCommission.updateOne(
            { referredUser: req.user._id },
            {
                $set: { productBought: true },
                $setOnInsert: { referrer: req.user.referredBy, referredUser: req.user._id },
            },
            { upsert: true }
        );
        await ReferralCommission.updateOne(
            { referredUser: req.user._id, triggeringOrder: { $exists: false } },
            { $set: { triggeringOrder: order._id } }
        );
    }

    // Best-effort — email is optional at checkout, and a delivery failure
    // shouldn't fail an order that's already been placed.
    if (shipping.email) {
        try {
            await sendOrderConfirmationEmail({ to: shipping.email, order });
        } catch (err) {
            console.error('Failed to send order confirmation email:', err.message);
        }
    }

    res.status(201).json({ order: toPublicOrder(order) });
});

// GET /api/orders/my — requires login.
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders: orders.map(toPublicOrder) });
});

// GET /api/orders/track?orderId=&phone= — no auth, so the phone used at
// checkout doubles as the shared secret proving the requester owns the order.
// `orderId` accepts the customer-facing orderNumber (e.g. "FT-A1B2C3D4") as
// well as the raw Mongo _id, so links/orders issued before orderNumber
// existed still resolve.
export const trackOrder = asyncHandler(async (req, res) => {
    const { orderId, phone } = req.query;

    if (!orderId || !phone) {
        res.status(400);
        throw new Error('A valid order ID and phone number are required');
    }

    const trimmedId = String(orderId).trim();
    const order = mongoose.isValidObjectId(trimmedId)
        ? await Order.findById(trimmedId)
        : await Order.findOne({ orderNumber: trimmedId.toUpperCase() });

    if (!order || normalizePhone(order.shipping.phone) !== normalizePhone(phone)) {
        res.status(404);
        throw new Error('No order found for that order ID and phone number');
    }

    res.json({ order: toPublicOrder(order) });
});
