import express from 'express';
import {
    listEnrollments,
    updateEnrollment,
    resendApprovalEmail,
    deleteEnrollment,
} from '../controllers/adminCourseEnrollments.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Same gating as consultations: any admin can review enrolments, deletion
// alone is super-admin-only.
router.use(protectAdmin);

router.get('/', listEnrollments);
router.patch('/:id', updateEnrollment);
router.post('/:id/resend-email', resendApprovalEmail);
router.delete('/:id', requireSuperAdmin, deleteEnrollment);

export default router;
