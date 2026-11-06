import express from 'express';
import {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/adminCategories.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Any admin can manage categories, matching the /products route gating in
// the admin panel (not restricted to super admins).
router.use(protectAdmin);

router.get('/', listCategories);
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
