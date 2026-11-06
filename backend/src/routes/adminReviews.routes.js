import express from 'express';
import {
    listReviews,
    addAdminReply,
    updateAdminReply,
    deleteReply,
    deleteReview,
} from '../controllers/adminReviews.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Review management is super-admin-only, matching the /reviews route gating
// already in the admin panel.
router.use(protectAdmin, requireSuperAdmin);

router.get('/', listReviews);
router.delete('/:id', deleteReview);

router.post('/:id/replies', addAdminReply);
router.patch('/:id/replies/:replyId', updateAdminReply);
router.delete('/:id/replies/:replyId', deleteReply);

export default router;
