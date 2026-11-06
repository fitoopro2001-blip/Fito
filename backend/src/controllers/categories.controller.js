import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/Category.model.js';
import { CATEGORY_STATUS } from '../constants/categoryStatus.js';
import { toPublicCategory } from '../utils/serializers.js';

// GET /api/categories — active categories, for the shop filter dropdown and
// the footer's Shop links.
export const listCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ status: CATEGORY_STATUS.ACTIVE }).sort({ name: 1 });
    res.json({ categories: categories.map(toPublicCategory) });
});
