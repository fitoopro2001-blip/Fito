export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/',
    USERS: '/users',
    REFERRALS: '/referrals',
    CONSULTATIONS: '/consultations',
    CONSULTATION_DETAIL: '/consultations/:id',
    CONSULTATION_PRICING: '/consultations/goal/:goalId/pricing',
    PRODUCTS: '/products',
    PRODUCT_ADD: '/products/add',
    PRODUCT_EDIT: '/products/:id/edit',
    CATEGORIES: '/categories',
    REVIEWS: '/reviews',
    ORDERS: '/orders',
    BLOGS: '/blogs',
    BLOG_ADD: '/blogs/add',
    BLOG_EDIT: '/blogs/:id/edit',
    NOTIFICATIONS: '/notifications',
    CAREERS: '/careers',
    CAREER_APPLICATIONS: '/careers/applications',
    SUBSCRIBERS: '/subscribers',
    SETTINGS: '/settings',
    UNAUTHORIZED: '/unauthorized',
};

export const consultationDetailPath = (id) => `/consultations/${id}`;
export const consultationPricingPath = (goalId) => `/consultations/goal/${goalId}/pricing`;
export const productEditPath = (id) => `/products/${id}/edit`;
export const blogEditPath = (id) => `/blogs/${id}/edit`;
