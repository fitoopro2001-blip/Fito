// Text primitives shared by the product and blog SEO generators so both
// produce meta copy with identical truncation and keyword rules.
export const BRAND = 'Fito';
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 160;

// Cuts at the last word boundary so titles/descriptions never end mid-word.
export const clamp = (value, limit) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) return text;
    const cut = text.slice(0, limit - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:-]$/, '')}…`;
};

const STOP_WORDS = new Set([
    'with', 'for', 'and', 'the', 'per', 'zero', 'pure', 'your', 'from', 'plus', 'more',
    'this', 'that', 'what', 'how', 'why', 'when', 'you', 'are', 'was', 'were', 'has',
    'have', 'been', 'can', 'will', 'not', 'but', 'all', 'any', 'its', 'their', 'about',
]);

export const keywordsFrom = (text, max) =>
    [
        ...new Set(
            String(text ?? '')
                .toLowerCase()
                .match(/[a-z0-9+]{3,}/g) ?? []
        ),
    ]
        .filter((word) => !STOP_WORDS.has(word))
        .slice(0, max);

// The brand suffix must survive truncation, so the qualifier (category, etc.)
// is only appended when the full title still fits inside the limit.
export const composeTitle = (primary, qualifier) => {
    const suffix = ` | ${BRAND}`;
    const full = qualifier ? `${primary} - ${qualifier}` : primary;
    return `${full}${suffix}`.length <= TITLE_LIMIT
        ? `${full}${suffix}`
        : `${clamp(primary, TITLE_LIMIT - suffix.length)}${suffix}`;
};

// First sentence reads as a summary; the rest is detail a search snippet drops.
export const firstSentence = (text) => {
    const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
    return clean.split(/(?<=[.!?])\s+/)[0] || clean;
};

// Blog `content` and product `description` are both saved as HTML from the
// panel's Tiptap editor — strip tags before counting words or pulling a
// summary/keywords out of either.
export const stripTags = (html = '') =>
    String(html)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
