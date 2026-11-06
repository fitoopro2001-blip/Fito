import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Course from '../models/Course.model.js';
import CourseEnrollment from '../models/CourseEnrollment.model.js';
import { COURSE_STATUS, ENROLLMENT_STATUS } from '../constants/course.js';
import { PHONE_REGEX, EMAIL_REGEX } from '../constants/personalInfo.js';
import { toPublicCourseEnrollment } from '../utils/serializers.js';
import { toImageUrl } from '../middleware/upload.middleware.js';

// POST /api/course-enrollments (multipart/form-data) — login required (see
// `protect` on the route). Fields: courseId, fullName, email, phone,
// qualification, notes, transactionId, plus the paymentScreenshot file
// (required).
export const createEnrollment = asyncHandler(async (req, res) => {
    const { courseId, fullName, email, phone, qualification, notes, transactionId } = req.body;

    if (!mongoose.isValidObjectId(courseId)) {
        res.status(400);
        throw new Error('Invalid course selected');
    }
    if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
        res.status(400);
        throw new Error('Full name, email and phone are required');
    }
    if (!EMAIL_REGEX.test(email.trim())) {
        res.status(400);
        throw new Error('Enter a valid email address');
    }
    if (!PHONE_REGEX.test(phone.trim())) {
        res.status(400);
        throw new Error('Enter a valid phone number');
    }

    const paymentScreenshot = toImageUrl(req.file);
    if (!paymentScreenshot) {
        res.status(400);
        throw new Error('Please attach your payment screenshot');
    }

    const course = await Course.findOne({ _id: courseId, status: COURSE_STATUS.PUBLISHED });
    if (!course) {
        res.status(404);
        throw new Error('This course is not open for enrolment');
    }

    // A rejected enrolment can be resubmitted; a pending or approved one can't
    // be duplicated.
    const existing = await CourseEnrollment.findOne({
        user: req.user._id,
        course: course._id,
        status: { $in: [ENROLLMENT_STATUS.PENDING, ENROLLMENT_STATUS.APPROVED] },
    });
    if (existing) {
        res.status(409);
        throw new Error(
            existing.status === ENROLLMENT_STATUS.APPROVED
                ? 'You are already enrolled in this course'
                : 'Your enrolment for this course is already awaiting payment approval'
        );
    }

    // The price charged is read from the course rather than trusted from the
    // client.
    const enrollment = await CourseEnrollment.create({
        user: req.user._id,
        course: course._id,
        courseSnapshot: {
            code: course.code,
            title: course.title,
            slug: course.slug,
            price: course.price,
            originalPrice: course.originalPrice > course.price ? course.originalPrice : undefined,
        },
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        qualification: qualification?.trim() || undefined,
        notes: notes?.trim() || undefined,
        paymentScreenshot,
        transactionId: transactionId?.trim() || undefined,
    });

    res.status(201).json({ enrollment: toPublicCourseEnrollment(enrollment) });
});

// GET /api/course-enrollments/my
export const getMyEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await CourseEnrollment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ enrollments: enrollments.map(toPublicCourseEnrollment) });
});
