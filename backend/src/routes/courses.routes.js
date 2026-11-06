import express from 'express';
import { listCourses, getCourse } from '../controllers/courses.controller.js';

const router = express.Router();

// Public — anyone can browse the academy catalogue without logging in.
router.get('/', listCourses);
router.get('/:idOrSlug', getCourse);

export default router;
