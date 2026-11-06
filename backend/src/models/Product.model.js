import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/contentStatus.js';
import { buildProductSeo, buildProductSlug } from '../utils/productSeo.js';
import ensureUniqueSlug from '../utils/uniqueSlug.js';

// `rating` and `reviewCount` are denormalized aggregates maintained by
// Review.model.js whenever a review is created/updated/deleted, so product
// listings don't need to join reviews on every read.
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        // Stores a Category.slug (see Category.model.js), not a display name.
        // Kept as a plain string rather than a schema-level enum since the
        // admin-managed category list changes at runtime; validated against
        // the Category collection in adminProducts.controller.js instead.
        category: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        // Percentage off `price`, shown as a struck-through original price on
        // the storefront. 0 means no discount.
        discountPercent: { type: Number, default: 0, min: 0, max: 100 },
        stock: { type: Number, default: 0, min: 0 },
        // Manual display order set by dragging rows in the admin product list;
        // lower sorts first. Both the admin list and the storefront default
        // sort read this, so reordering there also reorders the shop.
        sortOrder: { type: Number, default: 0, index: true },
        description: { type: String, required: true, trim: true },
        // First entry of `images` is the primary/thumbnail image. Stored as
        // absolute Cloudinary URLs (see upload.middleware.js).
        images: [{ type: String }],
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0, min: 0 },
        // Ordered key/value pairs (e.g. "Calories" -> "120 kcal"), rendered as a
        // table on the app's product page. Order is preserved since it's an array.
        nutritionFacts: [
            {
                _id: false,
                key: { type: String, required: true, trim: true },
                value: { type: String, required: true, trim: true },
            },
        ],
        // Purchasable variations of this product (e.g. size/flavor), each with
        // its own price/stock override. An empty array means the product is
        // sold as a single SKU using the top-level price/stock above.
        variants: [
            {
                _id: false,
                name: { type: String, required: true, trim: true },
                sku: { type: String, trim: true },
                price: { type: Number, min: 0 },
                stock: { type: Number, default: 0, min: 0 },
            },
        ],
        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            default: PRODUCT_STATUS.DRAFT,
        },
        // `seo.metaTitle`/keywords/headline/imageAlt are always generated from
        // the fields below. `seo.metaDescription` is the exception: an admin
        // can type their own in the product form, and it's preserved across
        // edits; leaving it blank falls back to the generated copy (same
        // pattern as `readTime` in Blog.model.js).
        slug: { type: String, unique: true, sparse: true, index: true },
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [{ type: String }],
            headline: String,
            imageAlt: String,
            generatedAt: Date,
        },
    },
    { timestamps: true }
);

// Fields the generated copy reads from; touching any of them invalidates the SEO block.
const SEO_SOURCE_FIELDS = ['name', 'category', 'price', 'stock', 'status', 'description'];

productSchema.pre('save', async function assignSeo() {
    if (
        this.isNew ||
        SEO_SOURCE_FIELDS.some((field) => this.isModified(field)) ||
        this.isModified('seo.metaDescription')
    ) {
        const customMetaDescription = this.seo?.metaDescription?.trim();
        this.seo = buildProductSeo(this);
        // An admin-entered description overrides the generated one; a blank
        // value means "auto-generate", so the freshly built one stands.
        if (customMetaDescription) this.seo.metaDescription = customMetaDescription;
    }
    // Slug stays pinned to the original name so existing links keep resolving,
    // even if the name is edited later. A numeric suffix is only added when
    // the base slug collides with another product's.
    if (!this.slug) this.slug = await ensureUniqueSlug(this.constructor, buildProductSlug(this), this._id);
});

// Powers the shop page's text search without a full-text index scan per keystroke.
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
