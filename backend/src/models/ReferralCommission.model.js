import mongoose from 'mongoose';
import { COMMISSION_STATUS } from '../constants/commissionStatus.js';

// One doc per referred user (not per consultation/order) — created the first
// time a referred signup submits a consultation (see consultations.controller.js)
// or places an order (see orders.controller.js), then managed entirely by
// admins from here on (amount/status/proof are all admin-entered, there's no
// automatic commission calculation).
const referralCommissionSchema = new mongoose.Schema(
    {
        referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        // The consultation/order that first triggered this record — kept for
        // admin context only, not re-checked on subsequent ones.
        triggeringConsultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
        triggeringOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        consultationBooked: { type: Boolean, default: false },
        productBought: { type: Boolean, default: false },
        status: {
            type: String,
            enum: Object.values(COMMISSION_STATUS),
            default: COMMISSION_STATUS.PENDING,
        },
        amount: { type: Number, default: null },
        proofScreenshot: { type: String, default: null },
        notes: { type: String, trim: true },
        sentAt: { type: Date, default: null },
        updatedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

export default mongoose.model('ReferralCommission', referralCommissionSchema);
