import express from 'express';
import {
    listConsultations,
    getConsultationById,
    updateConsultation,
    addAdminMessage,
    deleteConsultation,
} from '../controllers/adminConsultations.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Unlike Users/Reviews/Orders, any authenticated admin can manage
// consultations — matches ROUTES.CONSULTATIONS not being wrapped in
// RequireSuperAdmin in the admin SPA. Deletion alone is super-admin-only.
router.use(protectAdmin);

router.get('/', listConsultations);
router.get('/:id', getConsultationById);
router.patch('/:id', updateConsultation);
router.post('/:id/messages', addAdminMessage);
router.delete('/:id', requireSuperAdmin, deleteConsultation);

export default router;
