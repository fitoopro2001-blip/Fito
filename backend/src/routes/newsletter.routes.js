import express from 'express';
import { subscribe, unsubscribe } from '../controllers/newsletter.controller.js';

const router = express.Router();

// Public — no auth, matches the site's Newsletter/Footer subscribe forms.
router.post('/', subscribe);
// Public — clicked from an email client, not called by the app frontend.
router.get('/unsubscribe', unsubscribe);

export default router;
