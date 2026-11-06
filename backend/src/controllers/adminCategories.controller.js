import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/Category.model.js';
import Product from '../models/Product.model.js';
import slugify from '../utils/slugify.js';
import { CATEGORY_STATUS } from '../constants/categoryStatus.js';
import { toPublicCategory } from '../utils/serializers.js';

// GET /api/admin/categories — includes inactive categories, unlike the
// public listing, and annotates each with how many products use it (helps
// decide before disabling/deleting).
export const listCategories = asyncHandler(async (req, res) => {
    const [categories, counts] = await Promise.all([
        Category.find().sort({ name: 1 }),
        Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);
    const countBySlug = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    res.json({
        categories: categories.map((category) => ({
            ...toPublicCategory(category),
            productCount: countBySlug[category.slug] ?? 0,
        })),
    });
});

// POST /api/admin/categories
export const createCategory = asyncHandler(async (req, res) => {
    const { name, status } = req.body;

    if (!name?.trim()) {
        res.status(400);
        throw new Error('Name is required');
    }
    if (status && !Object.values(CATEGORY_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(CATEGORY_STATUS).join(', ')}`);
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);
    const duplicate = await Category.findOne({ $or: [{ name: trimmedName }, { slug }] });
    if (duplicate) {
        res.status(400);
        throw new Error('A category with this name already exists');
    }

    const category = await Category.create({ name: trimmedName, slug, status: status ?? CATEGORY_STATUS.ACTIVE });
    res.status(201).json({ category: toPublicCategory(category) });
});

// PATCH /api/admin/categories/:id — name and status only. Slug is pinned at
// creation so existing product references and shop/footer links never break.
export const updateCategory = asyncHandler(async (req, res) => {
    const { name, status } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    if (name !== undefined) {
        const trimmedName = name.trim();
        if (!trimmedName) {
            res.status(400);
            throw new Error('Name is required');
        }
        const duplicate = await Category.findOne({ name: trimmedName, _id: { $ne: category._id } });
        if (duplicate) {
            res.status(400);
            throw new Error('A category with this name already exists');
        }
        category.name = trimmedName;
    }
    if (status !== undefined) {
        if (!Object.values(CATEGORY_STATUS).includes(status)) {
            res.status(400);
            throw new Error(`Status must be one of: ${Object.values(CATEGORY_STATUS).join(', ')}`);
        }
        category.status = status;
    }

    await category.save();
    res.json({ category: toPublicCategory(category) });
});

// DELETE /api/admin/categories/:id — blocked while any product still
// references the slug, so products never end up with a dangling category.
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const inUse = await Product.countDocuments({ category: category.slug });
    if (inUse > 0) {
        res.status(400);
        throw new Error(`Cannot delete — ${inUse} product(s) still use this category`);
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted' });
});
