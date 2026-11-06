import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.model.js';
import { toPublicProduct } from '../utils/serializers.js';
import { PRODUCT_STATUS } from '../constants/contentStatus.js';

// Drafts are admin-only, so every app-side query is scoped to non-draft products.
const PUBLIC_FILTER = { status: { $ne: PRODUCT_STATUS.DRAFT } };

// GET /api/products?category=&search=&sort=
export const listProducts = asyncHandler(async (req, res) => {
    const { category, search, sort } = req.query;

    const filter = { ...PUBLIC_FILTER };
    if (category && category !== 'all') filter.category = category;
    if (search?.trim()) {
        // Escaped so a user typing regex characters can't alter the query.
        const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(safe, 'i');
        filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
    }

    const SORTS = {
        'price-low': { price: 1 },
        'price-high': { price: -1 },
        rating: { rating: -1 },
        default: { sortOrder: 1, createdAt: -1 },
    };

    const products = await Product.find(filter).sort(SORTS[sort] ?? SORTS.default);
    res.json({ products: products.map(toPublicProduct) });
});

// GET /api/products/:id — accepts either the ObjectId or the SEO slug so the
// app can move to /product/<slug> URLs without breaking existing id links.
export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const identifier = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

    const product = await Product.findOne({ ...identifier, ...PUBLIC_FILTER });
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Products created before SEO generation existed get backfilled on first
    // read; the pre-save hook does the actual work.
    if (!product.seo?.metaTitle || !product.slug) await product.save();

    res.json({ product: toPublicProduct(product) });
});
