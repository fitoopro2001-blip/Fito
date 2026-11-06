// Uploaded images come back as relative paths (/uploads/...) served by the API,
// so they need the API origin prefixed. Absolute URLs pass straight through.
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
);

export default function imageUrl(src) {
    if (!src) return '';
    if (src.startsWith('/uploads')) return `${API_ORIGIN}${src}`;
    return src;
}
