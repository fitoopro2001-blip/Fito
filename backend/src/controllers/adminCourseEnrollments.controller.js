import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import CourseEnrollment from '../models/CourseEnrollment.model.js';
import { ENROLLMENT_STATUS } from '../constants/course.js';
import { toPublicCourseEnrollment } from '../utils/serializers.js';
import { parsePagination, searchRegex } from '../utils/queryHelpers.js';
import { sendCourseEnrollmentApprovedEmail } from '../utils/mailer.util.js';

const USER_FIELDS = 'name email';

// Best-effort — a delivery failure shouldn't undo an approval that's already
// been saved. Returns whether the email went out so the panel can say so.
const sendApprovalEmail = async (enrollment) => {
    try {
        await sendCourseEnrollmentApprovedEmail({ to: enrollment.email, enrollment });
        enrollment.confirmationEmailSentAt = new Date();
        await enrollment.save();
        return true;
    } catch (err) {
        console.error('Failed to send enrolment confirmation email:', err.message);
        return false;
    }
};

// GET /api/admin/course-enrollments?page=&limit=&search=&status=&course=
export const listEnrollments = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, course } = req.query;

    const filter = {};
    if (Object.values(ENROLLMENT_STATUS).includes(status)) filter.status = status;
    if (mongoose.isValidObjectId(course)) filter.course = course;
    if (search?.trim()) {
        const regex = searchRegex(search);
        filter.$or = [
            { fullName: regex },
            { email: regex },
            { phone: regex },
            { 'courseSnapshot.title': regex },
        ];
    }

    const [enrollments, total] = await Promise.all([
        CourseEnrollment.find(filter)
            .populate('user', USER_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        CourseEnrollment.countDocuments(filter),
    ]);
    res.json({ items: enrollments.map(toPublicCourseEnrollment), total, page, limit });
});

// PATCH /api/admin/course-enrollments/:id — { status }. Moving an enrolment
// to approved emails the learner their confirmation.
export const updateEnrollment = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!Object.values(ENROLLMENT_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(ENROLLMENT_STATUS).join(', ')}`);
    }

    const enrollment = await CourseEnrollment.findById(req.params.id).populate('user', USER_FIELDS);
    if (!enrollment) {
        res.status(404);
        throw new Error('Enrolment not found');
    }

    const newlyApproved = status === ENROLLMENT_STATUS.APPROVED && enrollment.status !== ENROLLMENT_STATUS.APPROVED;

    enrollment.status = status;
    enrollment.reviewedBy = req.admin._id;
    enrollment.reviewedAt = new Date();
    await enrollment.save();

    const emailSent = newlyApproved ? await sendApprovalEmail(enrollment) : undefined;

    res.json({ enrollment: toPublicCourseEnrollment(enrollment), emailSent });
});

// POST /api/admin/course-enrollments/:id/resend-email — retry for an approved
// enrolment whose confirmation email didn't go out.
export const resendApprovalEmail = asyncHandler(async (req, res) => {
    const enrollment = await CourseEnrollment.findById(req.params.id).populate('user', USER_FIELDS);
    if (!enrollment) {
        res.status(404);
        throw new Error('Enrolment not found');
    }
    if (enrollment.status !== ENROLLMENT_STATUS.APPROVED) {
        res.status(400);
        throw new Error('Only approved enrolments can be sent a confirmation email');
    }

    const emailSent = await sendApprovalEmail(enrollment);
    if (!emailSent) {
        res.status(502);
        throw new Error('Failed to send the confirmation email');
    }

    res.json({ enrollment: toPublicCourseEnrollment(enrollment), emailSent });
});

// DELETE /api/admin/course-enrollments/:id — super admin only (see route).
export const deleteEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await CourseEnrollment.findById(req.params.id);
    if (!enrollment) {
        res.status(404);
        throw new Error('Enrolment not found');
    }

    await enrollment.deleteOne();

    res.json({ message: 'Enrolment deleted' });
});
