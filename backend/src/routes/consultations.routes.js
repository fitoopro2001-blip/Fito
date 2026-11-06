import express from 'express';
import {
    createConsultation,
    getMyConsultations,
    getMyConsultationById,
    addMyMessage,
} from '../controllers/consultations.controller.js';
import { protect, attachUserIfPresent } from '../middleware/auth.middleware.js';
import { uploadConsultationFiles } from '../middleware/upload.middleware.js';

const router = express.Router();

// Submission accepts guests; signed-in users are still linked to their account.
router.post('/', attachUserIfPresent, uploadConsultationFiles, createConsultation);

// Consultation history and chat contain private health data and remain account-only.
router.use(protect);
router.get('/my', getMyConsultations);
router.get('/:id', getMyConsultationById);
router.post('/:id/messages', addMyMessage);

export default router;
