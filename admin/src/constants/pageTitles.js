import { ROUTES } from './routes';

// Maps route paths to the title shown in the header. Order matters for
// matching — more specific paths should be listed before their parents.
export const PAGE_TITLES = [
    { path: ROUTES.CONSULTATION_DETAIL, title: 'Consultation Details' },
    { path: ROUTES.CONSULTATION_PRICING, title: 'Consultation Plan Pricing' },
    { path: ROUTES.DASHBOARD, title: 'Dashboard' },
    { path: ROUTES.USERS, title: 'User Management' },
    { path: ROUTES.REFERRALS, title: 'Referral Management' },
    { path: ROUTES.PROMO_CODES, title: 'Promo Code Management' },
    { path: ROUTES.CONSULTATIONS, title: 'Consultation Management' },
    { path: ROUTES.PRODUCTS, title: 'Product Management' },
    { path: ROUTES.REVIEWS, title: 'Review Management' },
    { path: ROUTES.ORDERS, title: 'Order Management' },
    { path: ROUTES.BLOGS, title: 'Blog Management' },
    { path: ROUTES.NOTIFICATIONS, title: 'Notification Management' },
    { path: ROUTES.CAREER_APPLICATIONS, title: 'Job Applications' },
    { path: ROUTES.CAREERS, title: 'Career Management' },
    { path: ROUTES.SETTINGS, title: 'Settings' },
    { path: ROUTES.UNAUTHORIZED, title: 'Unauthorized' },
];
