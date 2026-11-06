// Turns the SEO block the backend generates into a Next.js Metadata object.
// The backend owns the copy; this file only shapes it for the framework, so
// there's exactly one place where meta wording is decided.
import {
    SITE_NAME,
    SITE_TAGLINE,
    SITE_URL,
    DEFAULT_OG_IMAGE,
    DEFAULT_LOCALE,
    TWITTER_HANDLE,
    absoluteUrl,
} from '@/config/siteConfig';
import imageUrl from '@/utils/imageUrl';
import stripHtml from '@/utils/stripHtml';

const clamp = (value, limit) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    return text.length <= limit ? text : `${text.slice(0, limit - 1).trimEnd()}…`;
};

export const buildMetadata = ({
    title,
    description,
    path = '/',
    images = [],
    imageAlt,
    keywords = [],
    type = 'website',
    noIndex = false,
    // Only meaningful when type is 'article'.
    publishedTime,
    modifiedTime,
    authors = [],
} = {}) => {
    const canonical = absoluteUrl(path);
    const resolvedTitle = clamp(title || `${SITE_NAME} — ${SITE_TAGLINE}`, 70);
    const resolvedDescription = clamp(description || SITE_TAGLINE, 200);
    const ogImages = (images.length ? images : [DEFAULT_OG_IMAGE])
        .filter(Boolean)
        .slice(0, 4)
        .map((src) => ({ url: imageUrl(src), alt: imageAlt || resolvedTitle }));

    return {
        metadataBase: new URL(SITE_URL),
        // `absolute` opts out of the root layout's "%s | Fitoo" template, since
        // the generated metaTitle already carries the brand name.
        title: { absolute: resolvedTitle },
        description: resolvedDescription,
        keywords: keywords.length ? keywords : undefined,
        alternates: { canonical },
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true, googleBot: { index: true, follow: true } },
        openGraph: {
            type,
            siteName: SITE_NAME,
            locale: DEFAULT_LOCALE,
            url: canonical,
            title: resolvedTitle,
            description: resolvedDescription,
            images: ogImages,
            // og:article:* tags are ignored for non-article types.
            ...(type === 'article'
                ? { publishedTime, modifiedTime, authors: authors.filter(Boolean) }
                : {}),
        },
        twitter: {
            card: 'summary_large_image',
            site: TWITTER_HANDLE,
            title: resolvedTitle,
            description: resolvedDescription,
            images: ogImages.map((image) => image.url),
        },
    };
};

// Blog metadata mirrors the product path: text comes from blog.seo, with the
// raw fields as a fallback for posts not yet regenerated.
export const buildBlogMetadata = (post) => {
    if (!post) {
        return buildMetadata({
            title: `Article Not Found | ${SITE_NAME}`,
            description: 'This article is unavailable.',
            noIndex: true,
        });
    }

    const seo = post.seo ?? {};

    return {
        ...buildMetadata({
            title: seo.metaTitle || `${post.title} | ${SITE_NAME}`,
            description: seo.metaDescription || post.excerpt,
            path: `/blog/${post.slug}`,
            images: [post.image],
            imageAlt: seo.imageAlt || post.title,
            keywords: seo.keywords ?? [],
            type: 'article',
            noIndex: post.status === 'draft',
            publishedTime: post.publishedAt ?? post.createdAt,
            modifiedTime: post.updatedAt ?? post.publishedAt,
            authors: [post.author],
        }),
        authors: post.author ? [{ name: post.author }] : undefined,
    };
};

// Product metadata is a thin wrapper: everything textual comes from product.seo,
// with the raw product fields as a fallback for anything not yet generated.
export const buildProductMetadata = (product) => {
    if (!product) {
        return buildMetadata({
            title: `Product Not Found | ${SITE_NAME}`,
            description: 'This product is unavailable.',
            noIndex: true,
        });
    }

    const seo = product.seo ?? {};

    return buildMetadata({
        title: seo.metaTitle || `${product.name} | ${SITE_NAME}`,
        description: seo.metaDescription || stripHtml(product.description),
        path: `/product/${product.slug || product.id}`,
        images: product.images?.length ? product.images : [product.image],
        imageAlt: seo.imageAlt || product.name,
        keywords: seo.keywords ?? [],
        type: 'website',
        noIndex: product.status === 'draft',
    });
};

export default buildMetadata;
