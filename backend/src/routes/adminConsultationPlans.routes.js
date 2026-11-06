import express from 'express';
import {
    listConsultationPlans,
    createConsultationPlan,
    updateConsultationPlan,
    deleteConsultationPlan,
} from '../controllers/consultationPlans.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can manage plan pricing, matching the /products and
// /consultations route gating in the admin panel.
router.use(protectAdmin);

router.get('/', listConsultationPlans);
router.post('/', createConsultationPlan);
router.patch('/:id', updateConsultationPlan);
router.delete('/:id', deleteConsultationPlan);

export default router;
