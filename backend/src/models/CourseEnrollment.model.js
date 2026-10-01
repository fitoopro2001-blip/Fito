import mongoose from 'mongoose';
import { ENROLLMENT_STATUS } from '../constants/course.js';

// Enrolling requires login (see routes/courseEnrollments.routes.js), so
// `user` is always present — same as Consultation.
const courseEnrollmentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
        // Copied from the course at enrolment time, so later price/title edits
        // (or deleting the course) don't rewrite what this learner signed up for.
        courseSnapshot: {
            code: String,
            title: String,
            slug: String,
            price: Number,
            originalPrice: Number,
        },
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        qualification: { type: String, trim: true },
        notes: { type: String, trim: true },
        paymentScreenshot: { type: String, required: true },
        transactionId: { type: String, trim: true },
        status: {
            type: String,
            enum: Object.values(ENROLLMENT_STATUS),
            default: ENROLLMENT_STATUS.PENDING,
        },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        reviewedAt: { type: Date },
        // Set once the "you're enrolled" email has gone out, so the admin
        // panel can show (and retry) a failed delivery.
        confirmationEmailSentAt: { type: Date },
    },
    { timestamps: true }
);

courseEnrollmentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('CourseEnrollment', courseEnrollmentSchema);
