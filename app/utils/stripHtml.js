// Product `description` and blog `content`/`excerpt` are HTML from the
// admin's Tiptap editor — strip tags for spots that need a plain-text
// preview (card blurbs, JSON-LD fallbacks).
export default function stripHtml(html) {
    return String(html ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
