import { SITE_URL } from '@/config/siteConfig';

// Dashboard and auth routes are per-user, so they're kept out of the index.
export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard',
                    '/orders',
                    '/profile',
                    '/settings',
                    '/wishlist',
                    '/notifications',
                    '/checkout',
                    '/cart',
                    '/login',
                    '/register',
                    '/verify-otp',
                    '/forgot-password',
                    '/reset-password',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
