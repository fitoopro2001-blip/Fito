import mongoose from 'mongoose';
import { isQrReferralId } from '../constants/qrReferralIds.js';

const qrReferralSchema = new mongoose.Schema(
    {
        referralId: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: isQrReferralId,
                message: 'Invalid QR referral ID',
            },
        },
        name: { type: String, required: true, trim: true, maxlength: 60 },
        details: { type: String, default: '', trim: true, maxlength: 180 },
    },
    { timestamps: true }
);

export default mongoose.model('QrReferral', qrReferralSchema);
