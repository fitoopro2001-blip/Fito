// Shared pagination + search helpers so every admin list endpoint paginates
// and filters the same way instead of each controller reinventing it.

// Parses page/limit query params into a safe { page, limit, skip } trio,
// clamped so a bad or missing value can't request page 0 or an unbounded page.
export const parsePagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
};

// Escapes regex metacharacters so free-text search input can't be
// interpreted as a regex pattern.
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A case-insensitive partial-match RegExp built from raw search text.
export const searchRegex = (search) => new RegExp(escapeRegex(search.trim()), 'i');

// Case-insensitive partial match across several fields, OR'd together.
// Returns {} (no-op filter) when there's no search text.
export const buildSearchFilter = (search, fields) => {
    if (!search?.trim() || fields.length === 0) return {};
    const regex = searchRegex(search);
    return { $or: fields.map((field) => ({ [field]: regex })) };
};
