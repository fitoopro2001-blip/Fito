import express from 'express';
import {
    listCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../controllers/adminCourses.controller.js';
import { protectAdmin } from '../middleware/adminAuth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = express.Router();

// Any admin can manage courses, matching the /blogs and /careers route
// gating (not restricted to super admins).
router.use(protectAdmin);

router.get('/', listCourses);
router.get('/:id', getCourse);
router.post('/', uploadSingleImage, createCourse);
router.patch('/:id', uploadSingleImage, updateCourse);
router.delete('/:id', deleteCourse);

export default router;
