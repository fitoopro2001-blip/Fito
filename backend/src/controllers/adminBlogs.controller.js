import asyncHandler from '../utils/asyncHandler.js';
import Blog from '../models/Blog.model.js';
import { toPublicBlog } from '../utils/serializers.js';
import { BLOG_STATUS } from '../constants/contentStatus.js';
import { toImageUrl } from '../middleware/upload.middleware.js';
import slugify from '../utils/slugify.js';
import { parsePagination, buildSearchFilter } from '../utils/queryHelpers.js';
import sanitizeRichText from '../utils/sanitizeRichText.js';

// The panel's Tiptap editor only exposes bold, italic, strike and links, but
// the body is still saved as raw HTML — strip anything outside that set so a
// crafted request can't smuggle scripts/attributes into the public blog page.
const parseContent = (content) => (content === undefined ? undefined : sanitizeRichText(content));

// GET /api/admin/blogs?page=&limit=&search=&category=&status= — includes drafts.
export const listBlogs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category, status } = req.query;

    const filter = buildSearchFilter(search, ['title', 'author', 'category']);
    if (category) filter.category = category;
    if (Object.values(BLOG_STATUS).includes(status)) filter.status = status;

    const [blogs, total] = await Promise.all([
        Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Blog.countDocuments(filter),
    ]);
    res.json({ items: blogs.map(toPublicBlog), total, page, limit });
});

// GET /api/admin/blogs/:id
export const getBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        res.status(404);
        throw new Error('Blog post not found');
    }
    res.json({ blog: toPublicBlog(blog) });
});

// POST /api/admin/blogs (multipart/form-data, field name: image)
export const createBlog = asyncHandler(async (req, res) => {
    const { title, category, author, excerpt, readTime, status, date, content, metaDescription } = req.body;

    if (!title || !category || !author || !excerpt) {
        res.status(400);
        throw new Error('Title, category, author and excerpt are required');
    }
    if (status && !Object.values(BLOG_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(BLOG_STATUS).join(', ')}`);
    }

    const slug = slugify(title);
    if (await Blog.exists({ slug })) {
        res.status(409);
        throw new Error('A blog post with a similar title already exists');
    }

    const blog = await Blog.create({
        title,
        slug,
        category,
        author,
        excerpt,
        readTime,
        status,
        content: parseContent(content) ?? '',
        publishedAt: date ? new Date(date) : undefined,
        image: toImageUrl(req.file),
        seo: metaDescription ? { metaDescription } : undefined,
    });

    res.status(201).json({ blog: toPublicBlog(blog) });
});

// PATCH /api/admin/blogs/:id (multipart/form-data)
export const updateBlog = asyncHandler(async (req, res) => {
    const { title, category, author, excerpt, readTime, status, date, content, metaDescription } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    if (status && !Object.values(BLOG_STATUS).includes(status)) {
        res.status(400);
        throw new Error(`Status must be one of: ${Object.values(BLOG_STATUS).join(', ')}`);
    }

    // Retitling re-derives the slug, so published URLs follow the new title.
    if (title !== undefined && title !== blog.title) {
        const slug = slugify(title);
        if (await Blog.exists({ slug, _id: { $ne: blog._id } })) {
            res.status(409);
            throw new Error('A blog post with a similar title already exists');
        }
        blog.title = title;
        blog.slug = slug;
    }

    if (category !== undefined) blog.category = category;
    if (author !== undefined) blog.author = author;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (readTime !== undefined) blog.readTime = readTime;
    if (status !== undefined) blog.status = status;
    if (date) blog.publishedAt = new Date(date);
    if (metaDescription !== undefined) {
        blog.seo = blog.seo || {};
        blog.seo.metaDescription = metaDescription;
    }

    const parsedContent = parseContent(content);
    if (parsedContent !== undefined) blog.content = parsedContent;

    // Only replace the cover image when a new file was actually uploaded.
    const uploaded = toImageUrl(req.file);
    if (uploaded) blog.image = uploaded;

    await blog.save();

    res.json({ blog: toPublicBlog(blog) });
});

// DELETE /api/admin/blogs/:id
export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    await blog.deleteOne();

    res.json({ message: 'Blog post deleted' });
});
