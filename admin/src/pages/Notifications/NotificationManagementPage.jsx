import { useState } from 'react';
import { Descriptions, Button, message } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { PlusOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import RowActions from '../../components/molecules/RowActions';
import StatusTag from '../../components/atoms/StatusTag';
import DataTable from '../../components/organisms/DataTable';
import NotificationFormDrawer from '../../components/organisms/notifications/NotificationFormDrawer';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import { NOTIFICATION_TYPES, NOTIFICATION_AUDIENCES } from '../../data/notifications';
import {
    fetchNotifications,
    createNotification as createNotificationApi,
    updateNotification as updateNotificationApi,
    deleteNotification as deleteNotificationApi,
} from '../../api/adminNotifications.api';

const typeLabel = (value) => NOTIFICATION_TYPES.find((t) => t.value === value)?.label ?? value;
const audienceLabel = (value) => NOTIFICATION_AUDIENCES.find((a) => a.value === value)?.label ?? value;
const apiError = (err, fallback) => err?.response?.data?.message || fallback;

export default function NotificationManagementPage() {
    const serverQuery = useServerTableQuery(fetchNotifications);

    const notifications = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;
    const [saving, setSaving] = useState(false);

    const [viewing, setViewing] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    const openCreate = () => {
        setEditingNotification(null);
        setDrawerOpen(true);
    };

    const openEdit = (notification) => {
        setEditingNotification(notification);
        setDrawerOpen(true);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            if (editingNotification) {
                await updateNotificationApi(editingNotification.id, values);
                message.success('Notification updated');
            } else {
                await createNotificationApi(values);
                message.success('Notification created');
            }
            serverQuery.refetch();
            setDrawerOpen(false);
        } catch (err) {
            message.error(apiError(err, 'Failed to save notification'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotificationApi(id);
            serverQuery.refetch();
            message.success('Notification deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete notification'));
        }
    };

    const columns = [
        { title: 'Title', dataIndex: 'title' },
        { title: 'Message', dataIndex: 'message', ellipsis: true },
        {
            title: 'Type',
            dataIndex: 'type',
            filters: NOTIFICATION_TYPES.map((t) => ({ text: t.label, value: t.value })),
            filteredValue: [serverQuery.filters.type].filter(Boolean),
            render: (type) => <StatusTag status={type} />,
        },
        {
            title: 'Audience',
            dataIndex: 'audience',
            render: (audience) => audienceLabel(audience),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: [
                { text: 'Sent', value: 'sent' },
                { text: 'Scheduled', value: 'scheduled' },
                { text: 'Draft', value: 'draft' },
            ],
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Date',
            dataIndex: 'date',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions
                    onView={() => setViewing(record)}
                    onEdit={() => openEdit(record)}
                    onDelete={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Notification Management"
                subtitle="Send and manage notifications to your users"
                actions={
                    <>
                        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search notifications..." />
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            New Notification
                        </Button>
                    </>
                }
            />

            <DataTable
                columns={columns}
                data={notifications}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!viewing}
                title="Notification Details"
                onCancel={() => setViewing(null)}
                footer={null}
                centered
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
            >
                {viewing && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Title">{viewing.title}</Descriptions.Item>
                        <Descriptions.Item label="Message">{viewing.message}</Descriptions.Item>
                        <Descriptions.Item label="Type">{typeLabel(viewing.type)}</Descriptions.Item>
                        <Descriptions.Item label="Audience">{audienceLabel(viewing.audience)}</Descriptions.Item>
                        <Descriptions.Item label="Status"><StatusTag status={viewing.status} /></Descriptions.Item>
                        <Descriptions.Item label="Date">{viewing.date}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <NotificationFormDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleSubmit}
                initialValues={editingNotification}
                saving={saving}
            />
        </div>
    );
}
