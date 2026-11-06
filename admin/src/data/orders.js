export const recentOrders = [
    { id: 'ORD-3391', customer: 'Ahmed Raza', amount: 89.98, status: 'delivered', date: '2026-07-28' },
    { id: 'ORD-3390', customer: 'Sara Khan', amount: 49.99, status: 'processing', date: '2026-07-28' },
    { id: 'ORD-3389', customer: 'Fatima Noor', amount: 62.98, status: 'shipped', date: '2026-07-27' },
    { id: 'ORD-3388', customer: 'Usman Tariq', amount: 27.99, status: 'delivered', date: '2026-07-26' },
    { id: 'ORD-3387', customer: 'Hina Malik', amount: 34.99, status: 'cancelled', date: '2026-07-25' },
];

export const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

export const PAYMENT_METHODS = [
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'online', label: 'Online Transfer' },
];

// Mirrors the order shape produced by the checkout flow
// (app/app/(public)/checkout/page.jsx `orderRecord`), plus an admin-managed
// `status` field since the customer-facing app doesn't track order status yet.
export const orders = [
    {
        id: 'ORD-3391',
        placedAt: '2026-07-28T09:15:00.000Z',
        status: 'delivered',
        paymentMethod: 'cod',
        transactionId: '',
        screenshotAttached: false,
        total: 89.98,
        shipping: { name: 'Ahmed Raza', phone: '0300-1234567', address: 'House 12, Street 4, DHA Phase 6', city: 'Lahore' },
        items: [
            { name: 'Whey Protein Isolate', qty: 2, price: 34.99 },
            { name: 'Shaker Bottle', qty: 1, price: 20.0 },
        ],
    },
    {
        id: 'ORD-3390',
        placedAt: '2026-07-28T07:40:00.000Z',
        status: 'processing',
        paymentMethod: 'online',
        transactionId: 'TXN-88213',
        screenshotAttached: true,
        total: 49.99,
        shipping: { name: 'Sara Khan', phone: '0311-2345678', address: 'Flat 3B, Gulshan Block 5', city: 'Karachi' },
        items: [{ name: 'Multivitamin Gummies', qty: 1, price: 49.99 }],
    },
    {
        id: 'ORD-3389',
        placedAt: '2026-07-27T14:05:00.000Z',
        status: 'shipped',
        paymentMethod: 'online',
        transactionId: 'TXN-88190',
        screenshotAttached: true,
        total: 62.98,
        shipping: { name: 'Fatima Noor', phone: '0321-3456789', address: 'House 45, F-10/2', city: 'Islamabad' },
        items: [
            { name: 'Omega-3 Fish Oil', qty: 1, price: 27.99 },
            { name: 'Collagen Peptides', qty: 1, price: 34.99 },
        ],
    },
    {
        id: 'ORD-3388',
        placedAt: '2026-07-26T11:22:00.000Z',
        status: 'delivered',
        paymentMethod: 'cod',
        transactionId: '',
        screenshotAttached: false,
        total: 27.99,
        shipping: { name: 'Usman Tariq', phone: '0333-4567890', address: 'Street 7, Model Town', city: 'Lahore' },
        items: [{ name: 'Omega-3 Fish Oil', qty: 1, price: 27.99 }],
    },
    {
        id: 'ORD-3387',
        placedAt: '2026-07-25T16:50:00.000Z',
        status: 'cancelled',
        paymentMethod: 'online',
        transactionId: 'TXN-88104',
        screenshotAttached: false,
        total: 34.99,
        shipping: { name: 'Hina Malik', phone: '0345-5678901', address: 'House 21, Satellite Town', city: 'Rawalpindi' },
        items: [{ name: 'Collagen Peptides', qty: 1, price: 34.99 }],
    },
];
