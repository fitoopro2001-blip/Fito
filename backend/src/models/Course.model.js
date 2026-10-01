import mongoose from 'mongoose';
import { COURSE_STATUS, COURSE_CATEGORIES } from '../constants/course.js';

const curriculumRowSchema = new mongoose.Schema(
    {
        week: { type: Number, required: true },
        topic: { type: String, required: true, trim: true },
        practical: { type: String, trim: true, default: '' },
    },
    { _id: false }
);

const courseSchema = new mongoose.Schema(
    {
        // Catalogue id from the academy brief (C01, C02, ...). Optional for
        // courses added later through the admin panel.
        code: { type: String, trim: true, uppercase: true },
        // The app's detail route is /academy/courses/[slug].
        slug: { type: String, required: true, unique: true, trim: true },
        title: { type: String, required: true, trim: true },
        summary: { type: String, required: true, trim: true },
        category: { type: String, enum: COURSE_CATEGORIES, required: true },
        image: { type: String },
        // `price` is the amount actually charged (PKR). `originalPrice` is the
        // regular fee shown struck through beside it — only displayed when
        // it's higher than `price`.
        price: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, min: 0, default: 0 },
        durationWeeks: { type: Number, required: true, min: 1 },
        hours: { type: Number, required: true, min: 1 },
        schedule: { type: String, trim: true, default: '' },
        batchGuidance: { type: String, trim: true, default: '' },
        venue: { type: String, trim: true, default: '' },
        overview: { type: String, trim: true, default: '' },
        audience: { type: String, trim: true, default: '' },
        outcomes: [{ type: String, trim: true }],
        curriculum: [curriculumRowSchema],
        inclusions: { type: String, trim: true, default: '' },
        assessment: { type: String, trim: true, default: '' },
        disclaimer: { type: String, trim: true, default: '' },
        status: {
            type: String,
            enum: Object.values(COURSE_STATUS),
            default: COURSE_STATUS.DRAFT,
        },
        // Lower numbers list first on the academy page.
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

courseSchema.index({ status: 1, sortOrder: 1 });

export default mongoose.model('Course', courseSchema);
