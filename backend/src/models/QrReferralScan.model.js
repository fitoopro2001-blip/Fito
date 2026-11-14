import mongoose from 'mongoose';
import { isQrReferralId } from '../constants/qrReferralIds.js';

const qrReferralScanSchema = new mongoose.Schema(
    {
        eventId: { type: String, required: true, unique: true },
        referralId: {
            type: String,
            required: true,
            index: true,
            validate: {
                validator: isQrReferralId,
                message: 'Invalid QR referral ID',
            },
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('QrReferralScan', qrReferralScanSchema);
