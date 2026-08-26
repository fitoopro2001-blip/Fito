import express from 'express';
import { listProducts, getProduct } from '../controllers/products.controller.js';
import { restrictToPakistan } from '../middleware/countryAccess.middleware.js';

const router = express.Router();

// Public catalogue — no auth, browsing doesn't require an account. Physical
// products only ship within Pakistan (see countryAccess.middleware.js).
router.get('/', restrictToPakistan, listProducts);
router.get('/:id', restrictToPakistan, getProduct);

export default router;
