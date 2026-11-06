import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';
import Product from '../models/Product.model.js';
import Consultation from '../models/Consultation.model.js';
import Blog from '../models/Blog.model.js';
import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';
import Subscriber from '../models/Subscriber.model.js';
import { toPublicUser, toPublicOrder, toPublicReview, toPublicProduct, toPublicConsultation } from '../utils/serializers.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

// Cancelled orders never collected payment, so they're excluded from every
// revenue figure on the dashboard (summary total + sales chart).
const paidOrderFilter = { status: { $ne: ORDER_STATUS.CANCELLED } };

// Order line items only snapshot the product's `name` (not its id), so units
// sold per product can only be tallied by grouping on that name and matching
// it back to a live Product afterwards. Products renamed or deleted since
// they last sold won't match — dropped rather than shown with stale data.
const getBestSellingProducts = async () => {
    const sold = await Order.aggregate([
        { $match: paidOrderFilter },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', unitsSold: { $sum: '$items.qty' } } },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
    ]);
    if (!sold.length) return [];

    const products = await Product.find({ name: { $in: sold.map((s) => s._id) } });
    return sold
        .map((s) => {
            const product = products.find((p) => p.name === s._id);
            return product && { ...toPublicProduct(product), unitsSold: s.unitsSold };
        })
        .filter(Boolean);
};

// GET /api/admin/dashboard/summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalAdmins,
        totalProducts,
        totalConsultations,
        totalBlogs,
        totalReviews,
        totalSubscribers,
        salesAgg,
        recentUsers,
        recentOrders,
        recentReviews,
        bestSellingProducts,
        outOfStockProducts,
        recentConsultations,
    ] = await Promise.all([
        User.countDocuments(),
        Admin.countDocuments(),
        Product.countDocuments(),
        Consultation.countDocuments(),
        Blog.countDocuments(),
        Review.countDocuments(),
        Subscriber.countDocuments(),
        Order.aggregate([{ $match: paidOrderFilter }, { $group: { _id: null, total: { $sum: '$total' } } }]),
        User.find().sort({ createdAt: -1 }).limit(5),
        Order.find().sort({ createdAt: -1 }).limit(5),
        Review.find().populate('product', 'name').sort({ createdAt: -1 }).limit(5),
        getBestSellingProducts(),
        Product.find({ stock: { $lte: 0 } }).sort({ updatedAt: -1 }).limit(5),
        Consultation.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
        summary: {
            totalUsers,
            totalAdmins,
            totalProducts,
            totalConsultations,
            totalBlogs,
            totalReviews,
            totalSubscribers,
            totalSales: salesAgg[0]?.total ?? 0,
        },
        recentUsers: recentUsers.map(toPublicUser),
        recentOrders: recentOrders.map(toPublicOrder),
        recentReviews: recentReviews.map(toPublicReview),
        bestSellingProducts,
        outOfStockProducts: outOfStockProducts.map(toPublicProduct),
        recentConsultations: recentConsultations.map(toPublicConsultation),
    });
});

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// GET /api/admin/dashboard/sales?range=7d|30d|12m
// Bucketing is done in UTC throughout (both the Mongo $group keys and the JS
// label loop below) because Mongo's $year/$month/$dateToString default to
// UTC — mixing in server-local dates would shift the last bucket by a day on
// any server not running in UTC.
export const getSalesAnalytics = asyncHandler(async (req, res) => {
    const range = ['7d', '30d', '12m'].includes(req.query.range) ? req.query.range : '7d';

    if (range === '12m') {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
        const rows = await Order.aggregate([
            { $match: { ...paidOrderFilter, createdAt: { $gte: start } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    sales: { $sum: '$total' },
                },
            },
        ]);
        const byKey = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r.sales]));

        const data = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
            const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
            return { label: MONTH_LABELS[d.getUTCMonth()], sales: byKey.get(key) ?? 0 };
        });
        return res.json({ data });
    }

    const days = range === '30d' ? 30 : 7;
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));

    const rows = await Order.aggregate([
        { $match: { ...paidOrderFilter, createdAt: { $gte: start } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                sales: { $sum: '$total' },
            },
        },
    ]);
    const byKey = new Map(rows.map((r) => [r._id, r.sales]));

    const data = Array.from({ length: days }, (_, i) => {
        const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
        const key = d.toISOString().slice(0, 10);
        const label = range === '7d' ? DAY_LABELS[d.getUTCDay()] : `${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCDate()}`;
        return { label, sales: byKey.get(key) ?? 0 };
    });
    res.json({ data });
});
