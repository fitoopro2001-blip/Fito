import mongoose from 'mongoose';
import { REPLY_AUTHOR } from '../constants/contentStatus.js';
import Product from './Product.model.js';

// Replies live as subdocuments on the review they answer, which keeps a
// thread readable in one query. `authorType` says whether it came from a
// customer or the admin panel; exactly one of user/admin is populated.
const replySchema = new mongoose.Schema(
    {
        authorType: { type: String, enum: Object.values(REPLY_AUTHOR), required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        // Snapshotted so a thread still reads correctly if the account is
        // renamed or removed later.
        authorName: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        // Required — reviews are only accepted from logged-in users.
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true },
        replies: [replySchema],
    },
    { timestamps: true }
);

// One review per user per product; editing replaces the existing one.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Recalculates the denormalized rating/reviewCount on the parent product.
// Called after any write that can change a product's review set.
reviewSchema.statics.syncProductRating = async function syncProductRating(productId) {
    const [stats] = await this.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
        { $group: { _id: '$product', rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);

    await Product.findByIdAndUpdate(productId, {
        rating: stats ? Math.round(stats.rating * 10) / 10 : 0,
        reviewCount: stats ? stats.reviewCount : 0,
    });
};

export default mongoose.model('Review', reviewSchema);
