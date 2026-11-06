import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, List, Avatar, Tag, message } from 'antd';
import {
    TeamOutlined,
    CrownOutlined,
    ShoppingOutlined,
    MedicineBoxOutlined,
    ReadOutlined,
    StarOutlined,
    DollarOutlined,
    UserOutlined,
    FireOutlined,
    WarningOutlined,
    MailOutlined,
} from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SummaryCard from '../../components/molecules/SummaryCard';
import SalesChart from '../../components/organisms/SalesChart';
import RecentListCard from '../../components/organisms/RecentListCard';
import StatusTag from '../../components/atoms/StatusTag';
import { BRAND } from '../../constants/theme';
import { ROUTES, consultationDetailPath } from '../../constants/routes';
import { fetchDashboardSummary } from '../../api/adminDashboard.api';
import { useAuth } from '../../context/AuthContext';
import imageUrl from '../../utils/imageUrl';

const EMPTY_SUMMARY = {
    totalUsers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalConsultations: 0,
    totalBlogs: 0,
    totalReviews: 0,
    totalSubscribers: 0,
    totalSales: 0,
};

const orderCustomer = (order) => order.customer ?? order.shipping?.name ?? '—';
const orderAmount = (order) => order.amount ?? order.total ?? 0;
const orderDate = (order) => order.date ?? order.placedAt;

// A small coordinated palette (similar saturation/lightness) instead of
// arbitrary hues, so the stat row reads as one designed set.
export default function DashboardPage() {
    const navigate = useNavigate();
    const { isSuperAdmin } = useAuth();
    const [summary, setSummary] = useState(EMPTY_SUMMARY);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [outOfStockProducts, setOutOfStockProducts] = useState([]);
    const [recentConsultations, setRecentConsultations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchDashboardSummary()
            .then((data) => {
                if (cancelled) return;
                setSummary(data.summary);
                setRecentUsers(data.recentUsers);
                setRecentOrders(data.recentOrders);
                setRecentReviews(data.recentReviews);
                setBestSellingProducts(data.bestSellingProducts);
                setOutOfStockProducts(data.outOfStockProducts);
                setRecentConsultations(data.recentConsultations);
            })
            .catch(() => {
                if (!cancelled) message.error('Failed to load dashboard data');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const cards = [
        { icon: <TeamOutlined />, label: 'Total Users', value: summary.totalUsers.toLocaleString(), accent: BRAND.primary },
        { icon: <CrownOutlined />, label: 'Total Admins', value: summary.totalAdmins, accent: '#B8763B' },
        { icon: <ShoppingOutlined />, label: 'Total Products', value: summary.totalProducts, accent: '#3D74B8' },
        { icon: <MedicineBoxOutlined />, label: 'Total Consultations', value: summary.totalConsultations, accent: '#3F9B7B' },
        { icon: <ReadOutlined />, label: 'Total Blogs', value: summary.totalBlogs, accent: '#9C5FBF' },
        { icon: <StarOutlined />, label: 'Total Reviews', value: summary.totalReviews, accent: '#D4A72C' },
        { icon: <MailOutlined />, label: 'Newsletter Subscribers', value: summary.totalSubscribers, accent: '#C24E7A' },
        { icon: <DollarOutlined />, label: 'Total Sales', value: `Rs. ${summary.totalSales.toLocaleString()}`, accent: '#33587A' },
    ];

    return (
        <div>
            <PageHeading title="Dashboard" subtitle="Overview of your store performance" />

            <Row gutter={[16, 16]} className="mb-6">
                {cards.map((c) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={c.label}>
                        <SummaryCard {...c} loading={loading} />
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                {isSuperAdmin && (
                    <Col xs={24} lg={16}>
                        <SalesChart />
                    </Col>
                )}
                <Col xs={24} lg={isSuperAdmin ? 8 : 24}>
                    <RecentListCard
                        title="Recent Users"
                        loading={loading}
                        dataSource={recentUsers}
                        renderItem={(user) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} className="bg-primary-light text-primary" />}
                                    title={user.name}
                                    description={user.email}
                                />
                                <StatusTag status={user.status} />
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={12}>
                    <RecentListCard
                        title="Recent Orders"
                        loading={loading}
                        dataSource={recentOrders}
                        renderItem={(order) => (
                            <List.Item
                                className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => navigate(ROUTES.ORDERS, { state: { highlightOrderId: order.id } })}
                            >
                                <List.Item.Meta
                                    title={order.id}
                                    description={`${orderCustomer(order)} · ${orderDate(order)}`}
                                />
                                <div className="text-right">
                                    <p className="font-medium">Rs. {orderAmount(order).toFixed(2)}</p>
                                    <StatusTag status={order.status} />
                                </div>
                            </List.Item>
                        )}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <RecentListCard
                        title="Latest Reviews"
                        loading={loading}
                        dataSource={recentReviews}
                        renderItem={(review) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={`${review.name} · ${review.productName}`}
                                    description={review.comment}
                                />
                                <Tag color="gold">{review.rating}★</Tag>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={8}>
                    <RecentListCard
                        title="Best Selling Products"
                        loading={loading}
                        dataSource={bestSellingProducts}
                        renderItem={(product) => (
                            <List.Item
                                className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => navigate(ROUTES.PRODUCTS, { state: { highlightProductId: product.id } })}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" src={imageUrl(product.image)} icon={<FireOutlined />} />}
                                    title={product.name}
                                    description={`Rs. ${product.price.toFixed(2)}`}
                                />
                                <Tag color="volcano">{product.unitsSold} sold</Tag>
                            </List.Item>
                        )}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <RecentListCard
                        title="Out of Stock Products"
                        loading={loading}
                        dataSource={outOfStockProducts}
                        renderItem={(product) => (
                            <List.Item
                                className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => navigate(ROUTES.PRODUCTS, { state: { highlightProductId: product.id } })}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" src={imageUrl(product.image)} icon={<WarningOutlined />} />}
                                    title={product.name}
                                    description={`Rs. ${product.price.toFixed(2)}`}
                                />
                                <StatusTag status="out_of_stock" />
                            </List.Item>
                        )}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <RecentListCard
                        title="Recent Consultations"
                        loading={loading}
                        dataSource={recentConsultations}
                        renderItem={(consultation) => (
                            <List.Item
                                className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => navigate(consultationDetailPath(consultation.id))}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<MedicineBoxOutlined />} className="bg-primary-light text-primary" />}
                                    title={consultation.personalInfo?.fullName}
                                    description={consultation.goal?.replace(/-/g, ' ')}
                                />
                                <StatusTag status={consultation.status} />
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </div>
    );
}
