import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.model.js';
import Review from '../models/Review.model.js';
import Category from '../models/Category.model.js';
import { toPublicProduct } from '../utils/serializers.js';
import { PRODUCT_STATUS } from '../constants/contentStatus.js';
import { CATEGORY_STATUS } from '../constants/categoryStatus.js';
import { toImageUrl } from '../middleware/upload.middleware.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';
import sanitizeRichText from '../utils/sanitizeRichText.js';

// Products may only be assigned to an active, admin-defined category.
const isValidCategory = (category) => Category.exists({ slug: category, status: CATEGORY_STATUS.ACTIVE });

// `description` is HTML from the panel's Tiptap editor — an "empty" editor
// still sends `<p></p>`, so a plain falsy/blank check isn't enough.
const isContentEmpty = (html) => !html || !String(html).replace(/<[^>]*>/g, '').trim();

// Multipart bodies arrive as strings, so numeric fields need coercing.
const parseNumber = (value, fallback) => {
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

// `nutritionFacts` is sent as a JSON string over multipart (or a plain array
// over JSON requests); rows missing a key or value are dropped.
const parseNutritionFacts = (value) => {
    if (value === undefined) return undefined;
    let parsed;
    try {
        parsed = typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed
        .map((row) => ({ key: String(row?.key ?? '').trim(), value: String(row?.value ?? '').trim() }))
        .filter((row) => row.key && row.value);
};

// `variants` is sent as a JSON string over multipart (or a plain array over
// JSON requests); rows missing a name are dropped. `price`/`stock` are left
// unset (falls back to the top-level product price/stock) when blank.
const parseVariants = (value) => {
    if (value === undefined) return undefined;
    let parsed;
    try {
        parsed = typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed
        .map((row) => ({
            name: String(row?.name ?? '').trim(),
            sku: String(row?.sku ?? '').trim(),
            price: parseNumber(row?.price, undefined),
            stock: parseNumber(row?.stock, 0),
        }))
        .filter((row) => row.name);
};

// GET /api/admin/products?page=&limit=&search=&category=&status= — includes
// drafts, unlike the public listing.
export const listProducts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category, status } = req.query;

    const filter = buildSearchFilter(search, ['name', 'category']);
    if (category) filter.category = category;
    if (Object.values(PRODUCT_STATUS).includes(status)) filter.status = status;

    const [products, total] = await Promise.all([
        Product.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(filter),
    ]);
    res.json({ items: products.map(toPublicProduct), total, page, limit });
});

// PATCH /api/admin/products/reorder — body: `{ ids }`, product ids in the
// desired display order. Only meaningful against the full, unfiltered list
// (see the admin panel's reorder mode), since it assigns 0..n-1 by position.
export const reorderProducts = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('ids must be a non-empty array');
    }

    await Product.bulkWrite(
        ids.map((id, index) => ({
            updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } },
        }))
    );

    res.json({ message: 'Product order updated' });
});

// GET /api/admin/products/:id — includes drafts, unlike the public endpoint.
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ product: toPublicProduct(product) });
});

// POST /api/admin/products (multipart/form-data, field name: images)
export const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, discountPercent, stock, description, status, nutritionFacts, variants, metaDescription } =
        req.body;

    if (!name || !category || isContentEmpty(description)) {
        res.status(400);
        throw new Error('Name, category and description are required');
    }
    const parsedPrice = parseNumber(price);
    if (parsedPrice === undefined || parsedPrice < 0) {
        res.status(400);
        throw new Error('Price must be a non-negative number');
    }
    const parsedDiscount = parseNumber(discountPercent, 0);
    if (parsedDiscount < 0 || parsedDiscount > 100) {
        res.status(400);
        throw new Error('Discount percent must be between 0 and 100');
    }
    if (status && !Object.values(PRODUCT_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
    }
    if (!(await isValidCategory(category))) {
        res.status(400);
        throw new Error('Invalid category');
    }

    // New products go to the end of the manual order, not the front.
    const last = await Product.findOne().sort('-sortOrder').select('sortOrder');
    const nextSortOrder = (last?.sortOrder ?? -1) + 1;

    const product = await Product.create({
        name,
        category,
        price: parsedPrice,
        discountPercent: parsedDiscount,
        stock: parseNumber(stock, 0),
        sortOrder: nextSortOrder,
        description: sanitizeRichText(description),
        status,
        images: (req.files ?? []).map(toImageUrl),
        nutritionFacts: parseNutritionFacts(nutritionFacts) ?? [],
        variants: parseVariants(variants) ?? [],
        seo: metaDescription ? { metaDescription } : undefined,
    });

    res.status(201).json({ product: toPublicProduct(product) });
});

// PATCH /api/admin/products/:id (multipart/form-data)
// Newly uploaded files are appended to the gallery; `existingImages` lets the
// panel drop previously uploaded ones without re-uploading the rest.
export const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        price,
        discountPercent,
        stock,
        description,
        status,
        existingImages,
        nutritionFacts,
        variants,
        metaDescription,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (status && !Object.values(PRODUCT_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
    }
    if (category !== undefined && !(await isValidCategory(category))) {
        res.status(400);
        throw new Error('Invalid category');
    }
    if (discountPercent !== undefined) {
        const parsedDiscount = parseNumber(discountPercent, product.discountPercent);
        if (parsedDiscount < 0 || parsedDiscount > 100) {
            res.status(400);
            throw new Error('Discount percent must be between 0 and 100');
        }
    }

    if (description !== undefined && isContentEmpty(description)) {
        res.status(400);
        throw new Error('Description is required');
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = sanitizeRichText(description);
    if (status !== undefined) product.status = status;
    if (price !== undefined) product.price = parseNumber(price, product.price);
    if (discountPercent !== undefined) product.discountPercent = parseNumber(discountPercent, product.discountPercent);
    if (stock !== undefined) product.stock = parseNumber(stock, product.stock);
    const parsedNutritionFacts = parseNutritionFacts(nutritionFacts);
    if (parsedNutritionFacts !== undefined) product.nutritionFacts = parsedNutritionFacts;
    const parsedVariants = parseVariants(variants);
    if (parsedVariants !== undefined) product.variants = parsedVariants;
    if (metaDescription !== undefined) {
        product.seo = product.seo || {};
        product.seo.metaDescription = metaDescription;
    }

    if (existingImages !== undefined) {
        // A single value arrives as a string, multiple as an array.
        product.images = Array.isArray(existingImages)
            ? existingImages
            : [existingImages].filter(Boolean);
    }
    const uploaded = (req.files ?? []).map(toImageUrl);
    if (uploaded.length) product.images = [...product.images, ...uploaded];

    await product.save();

    res.json({ product: toPublicProduct(product) });
});

// DELETE /api/admin/products/:id — also clears reviews so no orphans remain.
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await Review.deleteMany({ product: product._id });
    await product.deleteOne();

    res.json({ message: 'Product deleted' });
});
