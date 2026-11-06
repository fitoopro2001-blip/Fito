import express from 'express';
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
} from '../controllers/adminProducts.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';
import { uploadProductImages } from '../middleware/upload.middleware.js';

const router = express.Router();

// Any admin can manage products, matching the /products route gating in the
// admin panel (not restricted to super admins).
router.use(protectAdmin);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', uploadProductImages, createProduct);
// Must come before the `/:id` PATCH below, or "reorder" is parsed as an id.
router.patch('/reorder', reorderProducts);
router.patch('/:id', uploadProductImages, updateProduct);
router.delete('/:id', deleteProduct);

export default router;
