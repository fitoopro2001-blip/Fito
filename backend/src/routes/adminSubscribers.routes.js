import express from 'express';
import { listSubscribers, sendBroadcast, deleteSubscriber } from '../controllers/adminSubscribers.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can manage subscribers, matching the /blogs route gating in the admin panel.
router.use(protectAdmin);

router.get('/', listSubscribers);
router.post('/broadcast', sendBroadcast);
router.delete('/:id', deleteSubscriber);

export default router;
