import express from 'express';
import { createOrder, getMyOrders, trackOrder } from '../controllers/orders.controller.js';
import { protect, attachUserIfPresent } from '../middleware/auth.middleware.js';
import { restrictToPakistan } from '../middleware/countryAccess.middleware.js';

const router = express.Router();

// Every order placed here is a physical-product order (consultations never go
// through this endpoint), so it's Pakistan-only just like the product routes.
router.post('/', restrictToPakistan, attachUserIfPresent, createOrder);
router.get('/my', protect, getMyOrders);
// Registered before any /:id-style route would be added, so "track" is never
// swallowed as an id param.
router.get('/track', trackOrder);

export default router;
