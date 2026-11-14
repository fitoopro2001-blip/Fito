import express from 'express';
import { recordQrReferralScan } from '../controllers/qrReferralScans.controller.js';

const router = express.Router();

router.post('/', recordQrReferralScan);

export default router;
