import { SITE_URL } from '@/config/siteConfig';
import { getProductsForSeo, getBlogsForSeo, getCoursesForSeo } from '@/services/seo.server';

// Products and posts added through the admin panel show up here on the next
// revalidation, so no one has to touch the sitemap when content changes.
export const revalidate = 3600;

const STATIC_ROUTES = [
    { path: '/', priority: 1, changeFrequency: 'daily' },
    { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
    { path: '/categories', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/academy', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.4, changeFrequency: 'monthly' },
];

export default async function sitemap() {
    const [products, blogs, courses] = await Promise.all([
        getProductsForSeo(),
        getBlogsForSeo(),
        getCoursesForSeo(),
    ]);

    return [
        ...STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
            url: `${SITE_URL}${path}`,
            lastModified: new Date(),
            changeFrequency,
            priority,
        })),
        ...products.map((product) => ({
            url: `${SITE_URL}/product/${product.slug || product.id}`,
            lastModified: new Date(product.updatedAt ?? product.createdAt ?? Date.now()),
            changeFrequency: 'weekly',
            priority: 0.8,
        })),
        ...blogs.map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt ?? post.publishedAt ?? Date.now()),
            changeFrequency: 'monthly',
            priority: 0.6,
        })),
        ...courses.map((course) => ({
            url: `${SITE_URL}/academy/courses/${course.slug}`,
            lastModified: new Date(course.updatedAt ?? course.createdAt ?? Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7,
        })),
    ];
}
