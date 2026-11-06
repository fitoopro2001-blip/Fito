import express from 'express';
import {
    listBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
} from '../controllers/adminBlogs.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = express.Router();

// Any admin can manage blogs, matching the /blogs route gating in the admin
// panel (not restricted to super admins).
router.use(protectAdmin);

router.get('/', listBlogs);
router.get('/:id', getBlog);
router.post('/', uploadSingleImage, createBlog);
router.patch('/:id', uploadSingleImage, updateBlog);
router.delete('/:id', deleteBlog);

export default router;
