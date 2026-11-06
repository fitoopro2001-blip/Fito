import express from 'express';
import { listCareerApplications, deleteCareerApplication } from '../controllers/adminCareerApplications.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can view job applications, matching /careers route gating.
router.use(protectAdmin);

router.get('/', listCareerApplications);
router.delete('/:id', deleteCareerApplication);

export default router;
