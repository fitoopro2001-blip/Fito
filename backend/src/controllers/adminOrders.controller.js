import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.model.js';
import { toPublicOrder } from '../utils/serializers.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { parsePagination, searchRegex } from '../utils/queryHelpers.js';
import Product from '../models/Product.model.js';
import { PRODUCT_STATUS } from '../constants/contentStatus.js';

const roundMoney = (value) => Math.round(value * 100) / 100;

const restoreReservedStock = async (reserved) => {
    const results = await Promise.allSettled(
        reserved.map(({ productId, variantName, qty }) =>
            Product.updateOne(
                variantName
                    ? { _id: productId, 'variants.name': variantName }
                    : { _id: productId },
                { $inc: variantName ? { 'variants.$.stock': qty } : { stock: qty } }
            )
        )
    );
    if (results.some((result) => result.status === 'rejected' || result.value.matchedCount !== 1)) {
        console.error('Failed to restore inventory after an incomplete POS order');
        const error = new Error('Order could not be completed and inventory restoration failed');
        error.statusCode = 500;
        throw error;
    }
};

// GET /api/admin/orders?page=&limit=&search=&status=
export const listOrders = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status } = req.query;

    const filter = {};
    if (Object.values(ORDER_STATUS).includes(status)) filter.status = status;
    if (search?.trim()) {
        const trimmed = search.trim();
        // The Mongo _id is only matched when the search text is actually a
        // valid ObjectId — orderNumber is the human-friendly id admins are
        // more likely to type or paste in.
        filter.$or = [
            { transactionId: searchRegex(trimmed) },
            { orderNumber: searchRegex(trimmed) },
            ...(mongoose.isValidObjectId(trimmed) ? [{ _id: trimmed }] : []),
        ];
    }

    const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter),
    ]);
    res.json({ items: orders.map(toPublicOrder), total, page, limit });
});

// POST /api/admin/orders/pos — create a manually priced sale and deduct stock.
export const createPosOrder = asyncHandler(async (req, res) => {
    const { items, deliveryCharge = 0, paymentMethod, shipping } = req.body;
    const parsedDeliveryCharge = Number(deliveryCharge);

    if (!Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error('Order must contain at least one item');
    }
    if (!Number.isFinite(parsedDeliveryCharge) || parsedDeliveryCharge < 0) {
        res.status(400);
        throw new Error('Delivery charges must be a non-negative number');
    }
    if (!['cash', 'online'].includes(paymentMethod)) {
        res.status(400);
        throw new Error('Payment method must be cash or online');
    }
    if (!['name', 'phone', 'address', 'city'].every((field) => String(shipping?.[field] ?? '').trim())) {
        res.status(400);
        throw new Error('Customer name, phone, address and city are required');
    }

    const normalizedItems = items.map((item) => ({
        productId: String(item?.productId ?? ''),
        variantName: String(item?.variantName ?? '').trim(),
        qty: Number(item?.qty),
        price: Number(item?.price),
    }));
    if (
        normalizedItems.some(
            (item) =>
                !mongoose.isValidObjectId(item.productId) ||
                !Number.isInteger(item.qty) ||
                item.qty < 1 ||
                !Number.isFinite(item.price) ||
                item.price < 0
        )
    ) {
        res.status(400);
        throw new Error('Every item needs a valid product, selling price and quantity');
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const stockNeeds = new Map();
    const orderItems = normalizedItems.map((item) => {
        const product = productsById.get(item.productId);
        if (!product || product.status !== PRODUCT_STATUS.PUBLISHED) {
            res.status(400);
            throw new Error('A selected product is no longer available');
        }

        const variant = item.variantName
            ? product.variants.find((candidate) => candidate.name === item.variantName)
            : null;
        if ((product.variants.length && !variant) || (!product.variants.length && item.variantName)) {
            res.status(400);
            throw new Error(`Invalid product option for ${product.name}`);
        }

        const stockKey = `${item.productId}:${item.variantName}`;
        const existingNeed = stockNeeds.get(stockKey);
        if (existingNeed) existingNeed.qty += item.qty;
        else stockNeeds.set(stockKey, { productId: item.productId, variantName: item.variantName, qty: item.qty, name: product.name });

        return {
            productId: product._id,
            name: product.name,
            ...(item.variantName ? { variantName: item.variantName } : {}),
            qty: item.qty,
            price: roundMoney(item.price),
        };
    });

    const reserved = [];
    for (const need of stockNeeds.values()) {
        let updatedProduct;
        try {
            updatedProduct = await Product.findOneAndUpdate(
                need.variantName
                    ? {
                          _id: need.productId,
                          status: PRODUCT_STATUS.PUBLISHED,
                          variants: { $elemMatch: { name: need.variantName, stock: { $gte: need.qty } } },
                      }
                    : { _id: need.productId, status: PRODUCT_STATUS.PUBLISHED, stock: { $gte: need.qty } },
                { $inc: need.variantName ? { 'variants.$.stock': -need.qty } : { stock: -need.qty } },
                { new: true }
            );
        } catch (error) {
            await restoreReservedStock(reserved);
            throw error;
        }
        if (!updatedProduct) {
            await restoreReservedStock(reserved);
            res.status(409);
            throw new Error(`Insufficient stock for ${need.name}${need.variantName ? ` (${need.variantName})` : ''}`);
        }
        reserved.push(need);
    }

    const subtotal = roundMoney(orderItems.reduce((sum, item) => sum + item.price * item.qty, 0));
    let order;
    try {
        order = await Order.create({
            items: orderItems,
            subtotal,
            discountAmount: 0,
            deliveryCharge: roundMoney(parsedDeliveryCharge),
            total: roundMoney(subtotal + parsedDeliveryCharge),
            source: 'pos',
            paymentMethod,
            shipping,
        });
    } catch (error) {
        await restoreReservedStock(reserved);
        throw error;
    }

    res.status(201).json({ order: toPublicOrder(order) });
});

// PATCH /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    order.status = status;
    await order.save();

    res.json({ order: toPublicOrder(order) });
});
