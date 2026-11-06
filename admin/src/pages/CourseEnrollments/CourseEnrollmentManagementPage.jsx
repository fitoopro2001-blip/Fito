import { useState } from 'react';
import { Descriptions, Button, Image, Popconfirm, Space, Tooltip, Typography, message } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { CheckOutlined, CloseOutlined, EyeOutlined, MailOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import ConfirmDeleteButton from '../../components/molecules/ConfirmDeleteButton';
import StatusTag from '../../components/atoms/StatusTag';
import DataTable from '../../components/organisms/DataTable';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import { useAuth } from '../../context/AuthContext';
import { ENROLLMENT_STATUSES, formatPKR } from '../../constants/courses';
import imageUrl from '../../utils/imageUrl';
import {
    fetchCourseEnrollments,
    updateCourseEnrollment,
    resendEnrollmentEmail,
    deleteCourseEnrollment,
} from '../../api/adminCourseEnrollments.api';

const { Text } = Typography;

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

export default function CourseEnrollmentManagementPage() {
    const { isSuperAdmin } = useAuth();
    const serverQuery = useServerTableQuery(fetchCourseEnrollments);

    const enrollments = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;

    const [viewing, setViewing] = useState(null);
    // Id of the enrolment whose status change / email is in flight.
    const [busyId, setBusyId] = useState(null);

    const handleStatus = async (record, status) => {
        setBusyId(record.id);
        try {
            const { enrollment, emailSent } = await updateCourseEnrollment(record.id, { status });
            serverQuery.refetch();
            setViewing((current) => (current?.id === enrollment.id ? enrollment : current));

            if (status !== 'approved') {
                message.success('Enrolment rejected');
            } else if (emailSent) {
                message.success(`Payment approved — confirmation email sent to ${enrollment.email}`);
            } else {
                message.warning('Payment approved, but the confirmation email could not be sent. Use Resend Email to retry.');
            }
        } catch (err) {
            message.error(apiError(err, 'Failed to update enrolment'));
        } finally {
            setBusyId(null);
        }
    };

    const handleResend = async (record) => {
        setBusyId(record.id);
        try {
            const enrollment = await resendEnrollmentEmail(record.id);
            serverQuery.refetch();
            setViewing((current) => (current?.id === enrollment.id ? enrollment : current));
            message.success(`Confirmation email sent to ${enrollment.email}`);
        } catch (err) {
            message.error(apiError(err, 'Failed to send the confirmation email'));
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCourseEnrollment(id);
            serverQuery.refetch();
            message.success('Enrolment deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete enrolment'));
        }
    };

    // Approve / reject / resend, shared by the table row and the detail modal.
    const renderDecisionActions = (record, { withLabels = false } = {}) => {
        const busy = busyId === record.id;
        return (
            <>
                {record.status !== 'approved' && (
                    <Popconfirm
                        title="Approve this payment?"
                        description="The learner will be emailed their enrolment confirmation."
                        okText="Approve"
                        onConfirm={() => handleStatus(record, 'approved')}
                    >
                        <Tooltip title={withLabels ? undefined : 'Approve payment'}>
                            <Button
                                type={withLabels ? 'primary' : 'text'}
                                icon={<CheckOutlined />}
                                loading={busy}
                                className={withLabels ? undefined : '!text-green-600'}
                            >
                                {withLabels && 'Approve Payment'}
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                )}
                {record.status === 'pending' && (
                    <Popconfirm
                        title="Reject this enrolment?"
                        okText="Reject"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleStatus(record, 'rejected')}
                    >
                        <Tooltip title={withLabels ? undefined : 'Reject'}>
                            <Button type={withLabels ? 'default' : 'text'} danger icon={<CloseOutlined />} disabled={busy}>
                                {withLabels && 'Reject'}
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                )}
                {record.status === 'approved' && (
                    <Tooltip title={withLabels ? undefined : 'Resend confirmation email'}>
                        <Button
                            type={withLabels ? 'default' : 'text'}
                            icon={<MailOutlined />}
                            loading={busy}
                            onClick={() => handleResend(record)}
                        >
                            {withLabels && 'Resend Email'}
                        </Button>
                    </Tooltip>
                )}
            </>
        );
    };

    const columns = [
        {
            title: 'Learner',
            key: 'learner',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.fullName}</div>
                    <Text type="secondary" className="text-xs">
                        {record.email}
                    </Text>
                </div>
            ),
        },
        { title: 'Phone', dataIndex: 'phone' },
        {
            title: 'Course',
            key: 'course',
            render: (_, record) => record.course?.title ?? '—',
        },
        {
            title: 'Fee',
            key: 'fee',
            render: (_, record) => formatPKR(record.course?.price),
        },
        {
            title: 'Payment',
            dataIndex: 'paymentScreenshot',
            render: (src) => (
                <Image src={imageUrl(src)} width={48} height={48} className="rounded-lg object-cover" fallback="" />
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: ENROLLMENT_STATUSES.map((s) => ({ text: s, value: s })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Submitted',
            dataIndex: 'createdAt',
            render: formatDate,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="View">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => setViewing(record)} />
                    </Tooltip>
                    {renderDecisionActions(record)}
                    {/* Deletion is super-admin-only. */}
                    {isSuperAdmin && <ConfirmDeleteButton onConfirm={() => handleDelete(record.id)} />}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Course Enrolments"
                subtitle="Verify payment screenshots and approve enrolments"
                actions={<SearchBar value={searchText} onChange={setSearchText} placeholder="Search enrolments..." />}
            />

            <DataTable
                columns={columns}
                data={enrollments}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!viewing}
                title="Enrolment Details"
                onCancel={() => setViewing(null)}
                footer={viewing ? <Space>{renderDecisionActions(viewing, { withLabels: true })}</Space> : null}
                width={640}
            >
                {viewing && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Status">
                            <StatusTag status={viewing.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Course">
                            {viewing.course?.code && `${viewing.course.code} · `}
                            {viewing.course?.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fee">
                            {formatPKR(viewing.course?.price)}
                            {viewing.course?.originalPrice && (
                                <Text delete type="secondary" className="ml-2 text-xs">
                                    {formatPKR(viewing.course.originalPrice)}
                                </Text>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Full Name">{viewing.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewing.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{viewing.phone}</Descriptions.Item>
                        <Descriptions.Item label="Qualification">{viewing.qualification || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Notes">{viewing.notes || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Account">
                            {viewing.user?.name ? `${viewing.user.name} (${viewing.user.email})` : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Transaction ID">{viewing.transactionId || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Payment Screenshot">
                            <Image
                                src={imageUrl(viewing.paymentScreenshot)}
                                width={160}
                                className="rounded-lg"
                                fallback=""
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label="Submitted">{formatDate(viewing.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Reviewed">{formatDate(viewing.reviewedAt)}</Descriptions.Item>
                        <Descriptions.Item label="Confirmation Email">
                            {viewing.confirmationEmailSentAt
                                ? `Sent ${formatDate(viewing.confirmationEmailSentAt)}`
                                : 'Not sent'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}
