import mongoose from 'mongoose';
import { CATEGORY_STATUS } from '../constants/categoryStatus.js';

// Admin-managed list of product categories, replacing the old hardcoded
// dropdown. `slug` is the stable value stored on Product.category and used
// in shop/footer links — it's set once from `name` at creation and never
// changes, so existing product references and URLs keep resolving even if
// the display name is edited later (see adminCategories.controller.js).
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        slug: { type: String, required: true, trim: true, unique: true, index: true },
        status: {
            type: String,
            enum: Object.values(CATEGORY_STATUS),
            default: CATEGORY_STATUS.ACTIVE,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
