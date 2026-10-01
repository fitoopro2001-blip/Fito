// Server-only reads for generateMetadata() and sitemap generation.
// The axios client in services/api.js reaches into localStorage for the auth
// token, so it can't run during SSR — plain fetch keeps this usable on the
// server and lets Next cache and dedupe the response.
import { API_BASE_URL } from '@/config/siteConfig';

const REVALIDATE_SECONDS = 300;

const getJson = async (path) => {
    try {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            next: { revalidate: REVALIDATE_SECONDS },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        // A metadata fetch must never take the page down; callers fall back to
        // default metadata when this returns null.
        return null;
    }
};

export const getProductForSeo = async (idOrSlug) => {
    if (!idOrSlug) return null;
    const data = await getJson(`/products/${encodeURIComponent(idOrSlug)}`);
    return data?.product ?? null;
};

export const getProductsForSeo = async () => {
    const data = await getJson('/products');
    return data?.products ?? [];
};

// Returns { blog, related } so the detail page can hydrate both from one call.
export const getBlogForSeo = async (slug) => {
    if (!slug) return null;
    const data = await getJson(`/blogs/${encodeURIComponent(slug)}`);
    return data?.blog ? { blog: data.blog, related: data.related ?? [] } : null;
};

export const getBlogsForSeo = async () => {
    const data = await getJson('/blogs');
    return data?.blogs ?? [];
};

export const getCourseForSeo = async (slug) => {
    if (!slug) return null;
    const data = await getJson(`/courses/${encodeURIComponent(slug)}`);
    return data?.course ?? null;
};

export const getCoursesForSeo = async () => {
    const data = await getJson('/courses');
    return data?.courses ?? [];
};
