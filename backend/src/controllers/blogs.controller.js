import asyncHandler from '../utils/asyncHandler.js';
import Blog from '../models/Blog.model.js';
import { toPublicBlog } from '../utils/serializers.js';
import { BLOG_STATUS } from '../constants/contentStatus.js';

// Only published posts are ever exposed to the app.
const PUBLIC_FILTER = { status: BLOG_STATUS.PUBLISHED };

// GET /api/blogs?category=&limit=
export const listBlogs = asyncHandler(async (req, res) => {
    const { category, limit } = req.query;

    const filter = { ...PUBLIC_FILTER };
    if (category && category !== 'all') filter.category = category;

    const query = Blog.find(filter).sort({ publishedAt: -1 });
    // Used by the home page's "Latest Articles" section.
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isInteger(parsedLimit) && parsedLimit > 0) query.limit(parsedLimit);

    const blogs = await query;
    res.json({ blogs: blogs.map(toPublicBlog) });
});

// GET /api/blogs/categories — distinct list for the blog filter pills.
export const listBlogCategories = asyncHandler(async (req, res) => {
    const categories = await Blog.distinct('category', PUBLIC_FILTER);
    res.json({ categories: categories.sort() });
});

// GET /api/blogs/:slug — the app routes blog detail by slug, not id.
export const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, ...PUBLIC_FILTER });
    if (!blog) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    // Posts written before SEO generation existed get backfilled on first read.
    if (!blog.seo?.metaTitle) await blog.save();

    // Same-category suggestions powering the "More on {category}" strip.
    const related = await Blog.find({
        ...PUBLIC_FILTER,
        category: blog.category,
        _id: { $ne: blog._id },
    })
        .sort({ publishedAt: -1 })
        .limit(3);

    res.json({ blog: toPublicBlog(blog), related: related.map(toPublicBlog) });
});
