import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import { toPublicReview } from '../utils/serializers.js';
import { REPLY_AUTHOR } from '../constants/contentStatus.js';
import { parsePagination, searchRegex } from '../utils/queryHelpers.js';

// Populated so the table can show which product each review belongs to.
const withProduct = (query) => query.populate('product', 'name');

// GET /api/admin/reviews?page=&limit=&search=
export const listReviews = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search } = req.query;

    const filter = {};
    if (search?.trim()) {
        const regex = searchRegex(search);
        // `productName` isn't stored on Review, so matching it means finding
        // the product ids whose name matches and OR-ing those in too.
        const matchingProducts = await Product.find({ name: regex }).select('_id');
        filter.$or = [
            { userName: regex },
            { comment: regex },
            { product: { $in: matchingProducts.map((p) => p._id) } },
        ];
    }

    const [reviews, total] = await Promise.all([
        withProduct(Review.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Review.countDocuments(filter),
    ]);
    res.json({ items: reviews.map(toPublicReview), total, page, limit });
});

// POST /api/admin/reviews/:id/replies — admin answering a customer review.
export const addAdminReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        res.status(400);
        throw new Error('Reply message is required');
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    review.replies.push({
        authorType: REPLY_AUTHOR.ADMIN,
        admin: req.admin._id,
        authorName: req.admin.name,
        message: message.trim(),
    });
    await review.save();

    await review.populate('product', 'name');
    res.status(201).json({ review: toPublicReview(review) });
});

// PATCH /api/admin/reviews/:id/replies/:replyId — edit an admin reply.
export const updateAdminReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        res.status(400);
        throw new Error('Reply message is required');
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    const reply = review.replies.id(req.params.replyId);
    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }
    // Admins moderate customer replies by deleting them, not rewording them.
    if (reply.authorType !== REPLY_AUTHOR.ADMIN) {
        res.status(403);
        throw new Error('Only admin replies can be edited');
    }

    reply.message = message.trim();
    await review.save();

    await review.populate('product', 'name');
    res.json({ review: toPublicReview(review) });
});

// DELETE /api/admin/reviews/:id/replies/:replyId — admins can remove any reply
// in a thread, including customer ones, for moderation.
export const deleteReply = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    const reply = review.replies.id(req.params.replyId);
    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }

    reply.deleteOne();
    await review.save();

    await review.populate('product', 'name');
    res.json({ review: toPublicReview(review) });
});

// DELETE /api/admin/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    const productId = review.product;
    await review.deleteOne();
    // Removing a review changes the product's average, so recompute it.
    await Review.syncProductRating(productId);

    res.json({ message: 'Review deleted' });
});
