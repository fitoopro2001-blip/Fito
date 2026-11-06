// Kept in sync with admin/src/constants/courses.js and
// app/constants/courses.js.
export const COURSE_STATUS = Object.freeze({
    PUBLISHED: 'published',
    DRAFT: 'draft',
});

// One primary category per course (FITOO Academy catalogue).
export const COURSE_CATEGORIES = Object.freeze([
    'Business and Practice',
    'Clinical and Sports Nutrition',
    'Fitness Training and Coaching',
]);

// An enrolment starts pending until an admin has checked the attached
// payment screenshot.
export const ENROLLMENT_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
});
