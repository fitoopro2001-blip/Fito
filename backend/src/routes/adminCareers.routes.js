import express from 'express';
import {
    listCareers,
    createCareer,
    updateCareer,
    deleteCareer,
} from '../controllers/adminCareers.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can manage job postings, matching the /blogs and /notifications
// route gating (not restricted to super admins).
router.use(protectAdmin);

router.get('/', listCareers);
router.post('/', createCareer);
router.patch('/:id', updateCareer);
router.delete('/:id', deleteCareer);

export default router;
