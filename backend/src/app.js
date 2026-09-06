import path from 'node:path';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import adminAuthRoutes from './routes/adminAuth.routes.js';
import adminUsersRoutes from './routes/adminUsers.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import adminOrdersRoutes from './routes/adminOrders.routes.js';
import productsRoutes from './routes/products.routes.js';
import adminProductsRoutes from './routes/adminProducts.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import adminCategoriesRoutes from './routes/adminCategories.routes.js';
import blogsRoutes from './routes/blogs.routes.js';
import adminBlogsRoutes from './routes/adminBlogs.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import adminReviewsRoutes from './routes/adminReviews.routes.js';
import consultationsRoutes from './routes/consultations.routes.js';
import adminConsultationsRoutes from './routes/adminConsultations.routes.js';
import referralsRoutes from './routes/referrals.routes.js';
import adminReferralsRoutes from './routes/adminReferrals.routes.js';
import promoCodesRoutes from './routes/promoCodes.routes.js';
import adminPromoCodesRoutes from './routes/adminPromoCodes.routes.js';
import consultationPlansRoutes from './routes/consultationPlans.routes.js';
import adminConsultationPlansRoutes from './routes/adminConsultationPlans.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import adminNotificationsRoutes from './routes/adminNotifications.routes.js';
import adminDashboardRoutes from './routes/adminDashboard.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import adminSubscribersRoutes from './routes/adminSubscribers.routes.js';
import careersRoutes from './routes/careers.routes.js';
import adminCareersRoutes from './routes/adminCareers.routes.js';
import adminCareerApplicationsRoutes from './routes/adminCareerApplications.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Uploads now go straight to Cloudinary (see upload.middleware.js). This stays
// mounted only so any pre-Cloudinary /uploads/... URLs already stored in the
// database keep resolving.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/admin/blogs', adminBlogsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin/reviews', adminReviewsRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/admin/consultations', adminConsultationsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/admin/referrals', adminReferralsRoutes);
app.use('/api/promo-codes', promoCodesRoutes);
app.use('/api/admin/promo-codes', adminPromoCodesRoutes);
app.use('/api/consultation-plans', consultationPlansRoutes);
app.use('/api/admin/consultation-plans', adminConsultationPlansRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/notifications', adminNotificationsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin/subscribers', adminSubscribersRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/admin/careers', adminCareersRoutes);
app.use('/api/admin/career-applications', adminCareerApplicationsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
