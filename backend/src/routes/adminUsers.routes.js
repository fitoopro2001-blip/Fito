import express from 'express';
import { listUsers, updateUserStatus } from '../controllers/adminUsers.controller.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// App-user management (including activating signups) is super-admin-only,
// matching the /users route gating already in the admin panel.
router.use(protectAdmin, requireSuperAdmin);

router.get('/', listUsers);
router.patch('/:id/status', updateUserStatus);

export default router;
