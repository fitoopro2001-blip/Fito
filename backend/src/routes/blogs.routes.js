import express from 'express';
import { listBlogs, listBlogCategories, getBlogBySlug } from '../controllers/blogs.controller.js';

const router = express.Router();

// Public — published posts only (enforced in the controller).
router.get('/', listBlogs);
// Declared before '/:slug' so "categories" isn't matched as a slug.
router.get('/categories', listBlogCategories);
router.get('/:slug', getBlogBySlug);

export default router;
