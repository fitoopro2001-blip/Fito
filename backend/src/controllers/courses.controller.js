import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Course from '../models/Course.model.js';
import { COURSE_STATUS } from '../constants/course.js';
import { toPublicCourse } from '../utils/serializers.js';

// Only published courses are ever exposed to the app.
const PUBLIC_FILTER = { status: COURSE_STATUS.PUBLISHED };

// GET /api/courses
export const listCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find(PUBLIC_FILTER).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ courses: courses.map(toPublicCourse) });
});

// GET /api/courses/:idOrSlug
export const getCourse = asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const course = await Course.findOne({
        ...PUBLIC_FILTER,
        ...(mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug }),
    });
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    res.json({ course: toPublicCourse(course) });
});
