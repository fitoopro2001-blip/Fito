// Single source of truth for anything that ends up in meta tags, canonical
// URLs or JSON-LD. NEXT_PUBLIC_SITE_URL must be the public origin in prod,
// otherwise canonicals and OG images point at localhost.
export const SITE_NAME = 'Fitoo';
export const SITE_TAGLINE = 'Premium supplements and personalized diet consultation';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fitoo.pro').replace(
    /\/$/,
    ''
);
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const DEFAULT_OG_IMAGE = 'https://placehold.co/1200x630/1a1a1a/facc15?text=Fitoo';
export const TWITTER_HANDLE = '@Fitoo';
export const DEFAULT_LOCALE = 'en_US';
export const CURRENCY = 'PKR';

// Absolute URLs are required by Open Graph and schema.org; relative ones are
// silently ignored by most crawlers.
export const absoluteUrl = (path = '/') =>
    /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export default {
    SITE_NAME,
    SITE_TAGLINE,
    SITE_URL,
    API_BASE_URL,
    DEFAULT_OG_IMAGE,
    TWITTER_HANDLE,
    DEFAULT_LOCALE,
    CURRENCY,
};
