// Mirrors backend/src/constants/course.js — keep in sync.
export const COURSE_CATEGORIES = [
    'Business and Practice',
    'Clinical and Sports Nutrition',
    'Fitness Training and Coaching',
];

export const COURSE_STATUSES = ['published', 'draft'];

export const ENROLLMENT_STATUSES = ['pending', 'approved', 'rejected'];

export const formatPKR = (amount) => `PKR ${Number(amount ?? 0).toLocaleString('en-US')}`;
