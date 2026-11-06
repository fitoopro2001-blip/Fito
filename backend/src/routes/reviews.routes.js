import express from 'express';
import {
    listProductReviews,
    createReview,
    updateMyReview,
    deleteMyReview,
    addUserReply,
    deleteMyReply,
} from '../controllers/reviews.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Anyone can read reviews; only logged-in users can write or reply.
router.get('/product/:productId', listProductReviews);

router.post('/', protect, createReview);
router.patch('/:id', protect, updateMyReview);
router.delete('/:id', protect, deleteMyReview);

router.post('/:id/replies', protect, addUserReply);
router.delete('/:id/replies/:replyId', protect, deleteMyReply);

export default router;
