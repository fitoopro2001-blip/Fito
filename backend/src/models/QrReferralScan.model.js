import mongoose from 'mongoose';
import { QR_REFERRAL_IDS } from '../constants/qrReferralIds.js';

const qrReferralScanSchema = new mongoose.Schema(
    {
        eventId: { type: String, required: true, unique: true },
        referralId: { type: String, required: true, enum: QR_REFERRAL_IDS, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('QrReferralScan', qrReferralScanSchema);
