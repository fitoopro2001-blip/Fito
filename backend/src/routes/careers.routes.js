import express from 'express';
import { listCareers, applyToCareer } from '../controllers/careers.controller.js';

const router = express.Router();

// Public — anyone can browse open roles and apply without logging in.
router.get('/', listCareers);
router.post('/:id/apply', applyToCareer);

export default router;
