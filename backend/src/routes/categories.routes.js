import express from 'express';
import { listCategories } from '../controllers/categories.controller.js';

const router = express.Router();

// Public catalogue — no auth, browsing doesn't require an account.
router.get('/', listCategories);

export default router;
