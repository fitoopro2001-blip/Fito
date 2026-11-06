import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import { toPublicReview } from '../utils/serializers.js';
import { REPLY_AUTHOR } from '../constants/contentStatus.js';

const validateRating = (rating) => {
    const value = Number(rating);
    if (!Number.isFinite(value) || value < 1 || value > 5) {
        const err = new Error('Rating must be a number between 1 and 5');
        err.statusCode = 400;
        throw err;
    }
    return Math.round(value);
};

// Loads a review or 404s. Shared by every /:id route below.
const findReviewOr404 = async (id) => {
    const review = await Review.findById(id);
    if (!review) {
        const err = new Error('Review not found');
        err.statusCode = 404;
        throw err;
    }
    return review;
};

// GET /api/reviews/product/:productId — public.
export const listProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json({ reviews: reviews.map(toPublicReview) });
});

// POST /api/reviews — login required (see `protect` on the route).
export const createReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;

    if (!productId || !comment?.trim()) {
        res.status(400);
        throw new Error('Product and comment are required');
    }

    let score;
    try {
        score = validateRating(rating);
    } catch (err) {
        res.status(err.statusCode || 400);
        throw err;
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Enforced by the unique (product, user) index too; checked here so the
    // client gets a readable message instead of a duplicate-key error.
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
        res.status(409);
        throw new Error('You have already reviewed this product. Edit your existing review instead.');
    }

    const review = await Review.create({
        product: productId,
        user: req.user._id,
        userName: req.user.name,
        rating: score,
        comment: comment.trim(),
    });

    await Review.syncProductRating(productId);

    res.status(201).json({ review: toPublicReview(review) });
});

// PATCH /api/reviews/:id — a user may only edit their own review.
export const updateMyReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const review = await findReviewOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    if (String(review.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error('You can only edit your own review');
    }

    if (rating !== undefined) {
        try {
            review.rating = validateRating(rating);
        } catch (err) {
            res.status(err.statusCode || 400);
            throw err;
        }
    }
    if (comment !== undefined) {
        if (!comment.trim()) {
            res.status(400);
            throw new Error('Comment cannot be empty');
        }
        review.comment = comment.trim();
    }

    await review.save();
    await Review.syncProductRating(review.product);

    res.json({ review: toPublicReview(review) });
});

// DELETE /api/reviews/:id — a user may only delete their own review.
export const deleteMyReview = asyncHandler(async (req, res) => {
    const review = await findReviewOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    if (String(review.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error('You can only delete your own review');
    }

    const { product } = review;
    await review.deleteOne();
    await Review.syncProductRating(product);

    res.json({ message: 'Review deleted' });
});

// POST /api/reviews/:id/replies — login required. Lets customers continue the
// thread, e.g. answering an admin's reply on their own review.
export const addUserReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        res.status(400);
        throw new Error('Reply message is required');
    }

    const review = await findReviewOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    review.replies.push({
        authorType: REPLY_AUTHOR.USER,
        user: req.user._id,
        authorName: req.user.name,
        message: message.trim(),
    });
    await review.save();

    res.status(201).json({ review: toPublicReview(review) });
});

// DELETE /api/reviews/:id/replies/:replyId — a user may only remove their own reply.
export const deleteMyReply = asyncHandler(async (req, res) => {
    const review = await findReviewOr404(req.params.id).catch((err) => {
        res.status(err.statusCode || 404);
        throw err;
    });

    const reply = review.replies.id(req.params.replyId);
    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }
    if (reply.authorType !== REPLY_AUTHOR.USER || String(reply.user) !== String(req.user._id)) {
        res.status(403);
        throw new Error('You can only delete your own reply');
    }

    reply.deleteOne();
    await review.save();

    res.json({ review: toPublicReview(review) });
});
