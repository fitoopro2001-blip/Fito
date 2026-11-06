// Blog counterpart to productSeo.js. Called from Blog.model.js on save, so a
// post written in the admin panel gets its meta copy, keywords and reading time
// without anyone filling in SEO fields.
import {
    BRAND,
    DESCRIPTION_LIMIT,
    clamp,
    composeTitle,
    firstSentence,
    keywordsFrom,
    stripTags,
} from './seoText.js';

const WORDS_PER_MINUTE = 200;

// Body text plus the excerpt are what a reader actually gets through.
const wordCount = (bodyText = '', excerpt = '') =>
    [bodyText, excerpt].join(' ').trim().split(/\s+/).filter(Boolean).length;

export const estimateReadTime = (content, excerpt) => {
    const minutes = Math.max(1, Math.round(wordCount(stripTags(content), excerpt) / WORDS_PER_MINUTE));
    return `${minutes} min read`;
};

const buildBlogSeo = (blog) => {
    const title = String(blog.title ?? '').trim();
    const category = String(blog.category ?? '').trim();
    const author = String(blog.author ?? '').trim();
    const excerpt = String(blog.excerpt ?? '').trim();
    const bodyText = stripTags(blog.content);

    const metaTitle = composeTitle(title, category);

    // The excerpt is already summary copy, so it leads; the byline adds an
    // author signal without eating the snippet budget. A bare draft with no
    // excerpt or body still needs something indexable, hence the title fallback.
    const summary =
        firstSentence(excerpt) ||
        firstSentence(bodyText) ||
        [title, category].filter(Boolean).join(' - ');
    const metaDescription = clamp(
        `${summary}${author ? ` By ${author} on ${BRAND}.` : ''}`,
        DESCRIPTION_LIMIT
    );

    const keywords = [
        ...new Set([
            title.toLowerCase(),
            category.toLowerCase(),
            ...keywordsFrom(title, 5),
            ...keywordsFrom(excerpt, 5),
            // Guarded so a blank category can't produce a stray " tips" keyword.
            category && `${category.toLowerCase()} tips`,
            `${BRAND.toLowerCase()} blog`,
        ]),
    ].filter(Boolean);

    return {
        metaTitle,
        metaDescription,
        keywords,
        imageAlt: clamp([title, category].filter(Boolean).join(' - '), 120),
        // Word count feeds schema.org Article and the read-time label.
        wordCount: wordCount(bodyText, excerpt),
        generatedAt: new Date(),
    };
};

export { buildBlogSeo };
export default buildBlogSeo;
