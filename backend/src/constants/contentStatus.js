// Publish states shared by products and blogs. Kept in sync with
// admin/src/components/atoms/StatusTag.jsx colour map on the frontend.
export const PRODUCT_STATUS = Object.freeze({
    PUBLISHED: 'published',
    DRAFT: 'draft',
    OUT_OF_STOCK: 'out_of_stock',
    COMING_SOON: 'coming_soon',
});

export const BLOG_STATUS = Object.freeze({
    PUBLISHED: 'published',
    DRAFT: 'draft',
});

// Who wrote a reply on a review thread — a customer or someone from the
// admin panel. Drives how the reply is labelled/styled on both frontends.
export const REPLY_AUTHOR = Object.freeze({
    USER: 'user',
    ADMIN: 'admin',
});
