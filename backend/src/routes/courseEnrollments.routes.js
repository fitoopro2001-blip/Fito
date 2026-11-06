import express from 'express';
import { createEnrollment, getMyEnrollments } from '../controllers/courseEnrollments.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadPaymentScreenshot } from '../middleware/upload.middleware.js';

const router = express.Router();

// Like consultations, enrolling requires a logged-in account.
router.use(protect);

router.post('/', uploadPaymentScreenshot, createEnrollment);
router.get('/my', getMyEnrollments);

export default router;
