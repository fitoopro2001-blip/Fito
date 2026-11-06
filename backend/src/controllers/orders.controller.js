import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.model.js';
import ReferralCommission from '../models/ReferralCommission.model.js';
import { toPublicOrder } from '../utils/serializers.js';
import { sendOrderConfirmationEmail } from '../utils/mailer.util.js';
import {
    resolvePromoCode,
    claimPromoCode,
    linkPromoToOrder,
    releasePromoCode,
} from '../utils/promoCode.util.js';

// Digits only, so "0300-1234567" and "+92 300 1234567" both match what was
// stored at checkout.
const normalizePhone = (phone) => String(phone ?? '').replace(/\D/g, '');

// POST /api/orders — accepts guest checkout; if a valid token is attached
// (see attachUserIfPresent), the order is linked to that account.
export const createOrder = asyncHandler(async (req, res) => {
    const { items, paymentMethod, transactionId, screenshotAttached, shipping, promoCode } = req.body;

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

    // Checked before summing — a non-numeric price/qty would otherwise turn
    // the subtotal into NaN and fail deep inside schema validation.
    const isValidLine = (item) =>
        Number.isFinite(Number(item?.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item?.qty)) &&
        Number(item.qty) >= 1;
    if (!items.every(isValidLine)) {
        res.status(400);
        throw new Error('Every item needs a valid price and quantity');
    }

    // Derived from the line items rather than taken from the request, so the
    // stored subtotal/discount/total are always internally consistent (and a
    // client can't ask for a discount off a total it invented).
    const subtotal =
        Math.round(items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0) * 100) / 100;

    // Resolved before the order is created so an invalid/expired/used code
    // fails the checkout outright instead of silently charging full price.
    // Throws a 4xx with a customer-facing message (see resolvePromoCode).
    const applied = promoCode?.trim()
        ? await resolvePromoCode({ code: promoCode, subtotal, user: req.user }).catch((err) => {
              res.status(err.statusCode || 400);
              throw err;
          })
        : null;

    // Claim first: the code is single-use, so losing the race here must not
    // leave a discounted order behind. The order id is linked on afterwards.
    if (applied && !(await claimPromoCode({ promo: applied.promo, user: req.user, discountAmount: applied.discountAmount }))) {
        res.status(409);
        throw new Error('This promo code has already been used');
    }

    let order;
    try {
        order = await Order.create({
            user: req.user?._id,
            items,
            subtotal,
            discountAmount: applied?.discountAmount ?? 0,
            promoCode: applied
                ? {
                      code: applied.promo.code,
                      discountPercent: applied.promo.discountPercent,
                      promo: applied.promo._id,
                  }
                : undefined,
            total: Math.round((subtotal - (applied?.discountAmount ?? 0)) * 100) / 100,
            paymentMethod,
            transactionId,
            screenshotAttached,
            shipping,
        });
    } catch (err) {
        // Don't burn the customer's one-shot code on an order that never got
        // written.
        if (applied) await releasePromoCode(applied.promo);
        throw err;
    }

    if (applied) await linkPromoToOrder(applied.promo, order);

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
