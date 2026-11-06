import mongoose from 'mongoose';
import { BLOG_STATUS } from '../constants/contentStatus.js';
import slugify from '../utils/slugify.js';
import { buildBlogSeo, estimateReadTime } from '../utils/blogSeo.js';

// `content` is sanitized HTML (see adminBlogs.controller.js) written with the
// admin panel's Tiptap editor — the app renders it directly (see
// app/components/templates/BlogTemplate.jsx).
const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        category: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        excerpt: { type: String, required: true, trim: true },
        content: { type: String, default: '' },
        readTime: { type: String, trim: true },
        image: { type: String },
        publishedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: Object.values(BLOG_STATUS),
            default: BLOG_STATUS.DRAFT,
        },
        // `seo.metaTitle`/keywords/imageAlt/wordCount are always generated (see
        // utils/blogSeo.js). `seo.metaDescription` can be typed by the admin
        // instead; leaving it blank falls back to the generated copy, same as
        // the `readTime` fallback below.
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [{ type: String }],
            imageAlt: String,
            wordCount: Number,
            generatedAt: Date,
        },
    },
    { timestamps: true }
);

// Fields the generated copy reads from; touching any of them invalidates the SEO block.
const SEO_SOURCE_FIELDS = ['title', 'category', 'author', 'excerpt', 'content'];

blogSchema.pre('save', function assignSeo() {
    if (
        this.isNew ||
        SEO_SOURCE_FIELDS.some((field) => this.isModified(field)) ||
        this.isModified('seo.metaDescription')
    ) {
        const customMetaDescription = this.seo?.metaDescription?.trim();
        this.seo = buildBlogSeo(this);
        // An admin-entered description overrides the generated one; a blank
        // value means "auto-generate", so the freshly built one stands.
        if (customMetaDescription) this.seo.metaDescription = customMetaDescription;
        // Only fill read time in when the admin left it blank, so a manually
        // entered value is never overwritten on later edits.
        if (!this.readTime) this.readTime = estimateReadTime(this.content, this.excerpt);
    }
});

// Slug is derived from the title unless one was supplied explicitly. Uniqueness
// is enforced by the index above; the controller surfaces the conflict.
blogSchema.pre('validate', function setSlug() {
    if (!this.slug && this.title) {
        this.slug = slugify(this.title);
    }
});

export default mongoose.model('Blog', blogSchema);
