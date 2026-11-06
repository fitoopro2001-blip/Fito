// Order fulfillment status. Kept in sync with ORDER_STATUSES in
// admin/src/data/orders.js and the color map in admin/src/components/atoms/StatusTag.jsx.
export const ORDER_STATUS = Object.freeze({
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
});
