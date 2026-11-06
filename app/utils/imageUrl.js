// Uploads come back from the API as relative paths (/uploads/...), which
// next/image can't resolve on its own. Everything else (placeholders, remote
// URLs, local imports) is passed through untouched.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
);

const FALLBACK_IMAGE = 'https://placehold.co/600x600/1a1a1a/facc15?text=Fitoo';

export default function imageUrl(src) {
    if (!src) return FALLBACK_IMAGE;
    if (typeof src !== 'string') return src;
    if (src.startsWith('/uploads')) return `${API_ORIGIN}${src}`;
    return src;
}

export { FALLBACK_IMAGE };
