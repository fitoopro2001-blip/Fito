import asyncHandler from '../utils/asyncHandler.js';
import Course from '../models/Course.model.js';
import { COURSE_STATUS, COURSE_CATEGORIES } from '../constants/course.js';
import { toPublicCourse } from '../utils/serializers.js';
import { toImageUrl } from '../middleware/upload.middleware.js';
import slugify from '../utils/slugify.js';
import ensureUniqueSlug from '../utils/uniqueSlug.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';

// Plain-text fields copied straight from the body when present.
const TEXT_FIELDS = [
    'summary',
    'schedule',
    'batchGuidance',
    'venue',
    'overview',
    'audience',
    'inclusions',
    'assessment',
    'disclaimer',
];

// Multipart bodies arrive as strings, so the list fields are sent as JSON.
// Returns undefined when the field is absent or malformed, so an update
// leaves the stored value alone.
const parseJsonArray = (value) => {
    if (value === undefined || value === '') return undefined;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
};

const parseOutcomes = (value) =>
    parseJsonArray(value)
        ?.map((item) => String(item ?? '').trim())
        .filter(Boolean);

// Weeks are renumbered from row order, so the admin form never has to keep
// them in sync by hand.
const parseCurriculum = (value) =>
    parseJsonArray(value)
        ?.filter((row) => row?.topic?.trim())
        .map((row, index) => ({
            week: index + 1,
            topic: row.topic.trim(),
            practical: row.practical?.trim() ?? '',
        }));

// Returns an error message, or null when the fields supplied are valid.
// Only validates what's present, so it serves both create and update.
const validateFields = ({ category, status, price, originalPrice, durationWeeks, hours }) => {
    if (category !== undefined && !COURSE_CATEGORIES.includes(category)) {
        return `Category must be one of: ${COURSE_CATEGORIES.join(', ')}`;
    }
    if (status !== undefined && !Object.values(COURSE_STATUS).includes(status)) {
        return `Status must be one of: ${Object.values(COURSE_STATUS).join(', ')}`;
    }
    if (price !== undefined && !(Number(price) >= 0)) return 'Price must be zero or more';
    if (originalPrice !== undefined && originalPrice !== '' && !(Number(originalPrice) >= 0)) {
        return 'Actual price must be zero or more';
    }
    if (durationWeeks !== undefined && !(Number(durationWeeks) >= 1)) return 'Duration must be at least 1 week';
    if (hours !== undefined && !(Number(hours) >= 1)) return 'Hours must be at least 1';
    return null;
};

// GET /api/admin/courses?page=&limit=&search=&category=&status= — includes drafts.
export const listCourses = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category, status } = req.query;

    const filter = buildSearchFilter(search, ['title', 'code', 'summary']);
    if (COURSE_CATEGORIES.includes(category)) filter.category = category;
    if (Object.values(COURSE_STATUS).includes(status)) filter.status = status;

    const [courses, total] = await Promise.all([
        Course.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit),
        Course.countDocuments(filter),
    ]);
    res.json({ items: courses.map(toPublicCourse), total, page, limit });
});

// GET /api/admin/courses/:id
export const getCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    res.json({ course: toPublicCourse(course) });
});

// POST /api/admin/courses (multipart/form-data, field name: image).
// `outcomes` and `curriculum` are JSON-encoded arrays.
export const createCourse = asyncHandler(async (req, res) => {
    const { title, summary, category, price, durationWeeks, hours } = req.body;

    if (!title?.trim() || !summary?.trim() || !category || price === undefined || !durationWeeks || !hours) {
        res.status(400);
        throw new Error('Title, summary, category, price, duration and hours are required');
    }
    const invalid = validateFields(req.body);
    if (invalid) {
        res.status(400);
        throw new Error(invalid);
    }

    const course = new Course({
        title: title.trim(),
        slug: await ensureUniqueSlug(Course, slugify(req.body.slug?.trim() || title)),
        code: req.body.code?.trim() || undefined,
        category,
        price: Number(price),
        originalPrice: Number(req.body.originalPrice) || 0,
        durationWeeks: Number(durationWeeks),
        hours: Number(hours),
        status: req.body.status,
        sortOrder: Number(req.body.sortOrder) || 0,
        outcomes: parseOutcomes(req.body.outcomes) ?? [],
        curriculum: parseCurriculum(req.body.curriculum) ?? [],
        image: toImageUrl(req.file),
    });
    TEXT_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) course[field] = req.body[field];
    });
    await course.save();

    res.status(201).json({ course: toPublicCourse(course) });
});

// PATCH /api/admin/courses/:id (multipart/form-data)
export const updateCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    const invalid = validateFields(req.body);
    if (invalid) {
        res.status(400);
        throw new Error(invalid);
    }

    const { title, slug, code, category, price, originalPrice, durationWeeks, hours, status, sortOrder } = req.body;

    if (title !== undefined) {
        if (!title.trim()) {
            res.status(400);
            throw new Error('Title is required');
        }
        course.title = title.trim();
    }
    // The slug only changes when the admin edits it explicitly — retitling a
    // course keeps its public URL stable.
    if (slug !== undefined && slug.trim() && slugify(slug) !== course.slug) {
        course.slug = await ensureUniqueSlug(Course, slugify(slug), course._id);
    }
    if (code !== undefined) course.code = code.trim() || undefined;
    if (category !== undefined) course.category = category;
    if (price !== undefined) course.price = Number(price);
    if (originalPrice !== undefined) course.originalPrice = Number(originalPrice) || 0;
    if (durationWeeks !== undefined) course.durationWeeks = Number(durationWeeks);
    if (hours !== undefined) course.hours = Number(hours);
    if (status !== undefined) course.status = status;
    if (sortOrder !== undefined) course.sortOrder = Number(sortOrder) || 0;

    TEXT_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    const outcomes = parseOutcomes(req.body.outcomes);
    if (outcomes !== undefined) course.outcomes = outcomes;
    const curriculum = parseCurriculum(req.body.curriculum);
    if (curriculum !== undefined) course.curriculum = curriculum;

    // Only replace the image when a new file was actually uploaded.
    const uploaded = toImageUrl(req.file);
    if (uploaded) course.image = uploaded;

    await course.save();

    res.json({ course: toPublicCourse(course) });
});

// DELETE /api/admin/courses/:id — existing enrolments keep their own snapshot
// of the course, so they stay readable after it's gone.
export const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    await course.deleteOne();

    res.json({ message: 'Course deleted' });
});
