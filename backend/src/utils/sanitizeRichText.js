import sanitizeHtml from 'sanitize-html';

// Shared by every Tiptap-backed field in the admin panel (blog content,
// product description, newsletter messages) — they all use the same
// toolbar (bold/italic/strike/links/headings/lists), so one allowlist covers each.
const sanitizeRichText = (html) =>
    sanitizeHtml(String(html ?? ''), {
        allowedTags: ['p', 'strong', 'em', 's', 'a', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'span'],
        allowedAttributes: { a: ['href', 'target', 'rel'], span: ['style'] },
        // Only the text-size picker's inline font-size survives on <span>s.
        allowedStyles: { span: { 'font-size': [/^\d{1,3}px$/] } },
        allowedSchemes: ['http', 'https', 'mailto'],
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
        },
    }).trim();

export default sanitizeRichText;
