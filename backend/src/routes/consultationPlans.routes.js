import express from 'express';
import { listConsultationPlans } from '../controllers/consultationPlans.controller.js';

const router = express.Router();

// Public — the consultation flow needs current prices before login is required.
router.get('/', listConsultationPlans);

export default router;
