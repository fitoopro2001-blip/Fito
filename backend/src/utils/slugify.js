// Turns a title into a URL-safe slug. Blog routes on the app are
// /blog/[slug], so slugs must stay stable and unique.
const slugify = (value) =>
    String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export default slugify;
