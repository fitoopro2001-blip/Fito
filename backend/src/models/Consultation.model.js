import mongoose from 'mongoose';
import { REPLY_AUTHOR } from '../constants/contentStatus.js';
import { CONSULTATION_STATUS } from '../constants/consultationStatus.js';
import { CONSULTATION_GOALS } from '../constants/consultationGoals.js';
import { GENDERS, ACTIVITY_LEVELS } from '../constants/personalInfo.js';

// Same shape as Review.model.js's replySchema — a message thread between the
// customer and whichever admin is handling the consultation.
const messageSchema = new mongoose.Schema(
    {
        authorType: { type: String, enum: Object.values(REPLY_AUTHOR), required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        authorName: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

// Consultations require login (see routes/consultations.routes.js), so `user`
// is always present, unlike the guest-friendly Order model.
const consultationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        goal: { type: String, enum: CONSULTATION_GOALS, required: true },
        plan: {
            id: String,
            label: String,
            durationMonths: Number,
            price: Number,
            // Pre-discount price, set only when the plan had an active discount
            // at submission time — kept so admin views can show the strike-through.
            originalPrice: Number,
            // Currency `price`/`originalPrice` are denominated in, resolved
            // server-side from the submitter's detected country at booking
            // time (see createConsultation) — PKR/SAR/USD.
            currency: String,
        },
        personalInfo: {
            fullName: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true, lowercase: true },
            phone: { type: String, required: true, trim: true },
            dob: { type: Date, required: true },
            gender: { type: String, enum: GENDERS, required: true },
            activityLevel: { type: String, enum: ACTIVITY_LEVELS, required: true },
            height: { type: Number, required: true },
            weight: { type: Number, required: true },
        },
        // Fields vary per goal (see admin/src/data/consultations.js and
        // app/components/organisms/forms/*Form.jsx), so this is stored as-is
        // rather than modeled field-by-field.
        goalData: { type: mongoose.Schema.Types.Mixed, default: {} },
        uploads: {
            bodyPhotos: [{ type: String }],
            reports: [{ type: String }],
            paymentScreenshot: [{ type: String }],
        },
        transactionId: { type: String, trim: true },
        status: {
            type: String,
            enum: Object.values(CONSULTATION_STATUS),
            default: CONSULTATION_STATUS.PENDING,
        },
        // Defaults to submission time; an admin can move it when they actually
        // pick the case up (see ConsultationTable's "Assigned Date" field).
        assignedDate: { type: Date, default: Date.now },
        conversation: [messageSchema],
    },
    { timestamps: true }
);

export default mongoose.model('Consultation', consultationSchema);
