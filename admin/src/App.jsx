import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireSuperAdmin } from './components/templates/ProtectedRoute';
import AdminLayout from './components/templates/AdminLayout';
import { BRAND } from './constants/theme';

import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import SignupPage from './pages/Signup/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UserManagementPage from './pages/Users/UserManagementPage';
import ReferralManagementPage from './pages/Referrals/ReferralManagementPage';
import ConsultationManagementPage from './pages/Consultations/ConsultationManagementPage';
import ConsultationDetailPage from './pages/Consultations/ConsultationDetailPage';
import ConsultationPlanPricingPage from './pages/Consultations/ConsultationPlanPricingPage';
import ProductManagementPage from './pages/Products/ProductManagementPage';
import ProductFormPage from './pages/Products/ProductFormPage';
import CategoryManagementPage from './pages/Categories/CategoryManagementPage';
import BlogManagementPage from './pages/Blogs/BlogManagementPage';
import BlogFormPage from './pages/Blogs/BlogFormPage';
import NotificationManagementPage from './pages/Notifications/NotificationManagementPage';
import CareerManagementPage from './pages/Careers/CareerManagementPage';
import CareerApplicationManagementPage from './pages/CareerApplications/CareerApplicationManagementPage';
import SubscriberManagementPage from './pages/Subscribers/SubscriberManagementPage';
import ReviewManagementPage from './pages/Reviews/ReviewManagementPage';
import OrderManagementPage from './pages/Orders/OrderManagementPage';
import SettingsPage from './pages/Settings/SettingsPage';
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage';
import { ROUTES } from './constants/routes';

const theme = {
  token: {
    colorPrimary: BRAND.primary,
    colorPrimaryHover: BRAND.primaryHover,
    colorPrimaryActive: BRAND.primaryActive,
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorBgLayout: '#F5F6FA',
  },
  components: {
    Table: {
      borderRadius: 16,
      headerBg: '#FAFAFB',
      headerColor: '#6B7280',
      rowHoverBg: BRAND.primaryLight,
      cellPaddingBlock: 14,
      headerSplitColor: 'transparent',
    },
    Button: {
      controlHeight: 38,
      fontWeight: 500,
      primaryShadow: 'none',
    },
    Menu: {
      itemSelectedBg: BRAND.primaryLight,
      itemSelectedColor: BRAND.primary,
      itemBorderRadius: 10,
      itemMarginInline: 12,
      itemHeight: 42,
    },
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<AdminLayout />}>
                  <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                  <Route path={ROUTES.CONSULTATIONS} element={<ConsultationManagementPage />} />
                  <Route path={ROUTES.CONSULTATION_DETAIL} element={<ConsultationDetailPage />} />
                  <Route path={ROUTES.CONSULTATION_PRICING} element={<ConsultationPlanPricingPage />} />
                  <Route path={ROUTES.PRODUCTS} element={<ProductManagementPage />} />
                  <Route path={ROUTES.PRODUCT_ADD} element={<ProductFormPage />} />
                  <Route path={ROUTES.PRODUCT_EDIT} element={<ProductFormPage />} />
                  <Route path={ROUTES.CATEGORIES} element={<CategoryManagementPage />} />
                  <Route path={ROUTES.BLOGS} element={<BlogManagementPage />} />
                  <Route path={ROUTES.BLOG_ADD} element={<BlogFormPage />} />
                  <Route path={ROUTES.BLOG_EDIT} element={<BlogFormPage />} />
                  <Route path={ROUTES.NOTIFICATIONS} element={<NotificationManagementPage />} />
                  <Route path={ROUTES.CAREERS} element={<CareerManagementPage />} />
                  <Route path={ROUTES.CAREER_APPLICATIONS} element={<CareerApplicationManagementPage />} />
                  <Route path={ROUTES.SUBSCRIBERS} element={<SubscriberManagementPage />} />
                  <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                  <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

                  <Route element={<RequireSuperAdmin />}>
                    <Route path={ROUTES.USERS} element={<UserManagementPage />} />
                    <Route path={ROUTES.REFERRALS} element={<ReferralManagementPage />} />
                    <Route path={ROUTES.REVIEWS} element={<ReviewManagementPage />} />
                    <Route path={ROUTES.ORDERS} element={<OrderManagementPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
