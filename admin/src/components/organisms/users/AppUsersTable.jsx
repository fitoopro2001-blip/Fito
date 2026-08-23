import { useState } from 'react';
import { Descriptions, Form, Select, Tag, message } from 'antd';
import Modal from '../../atoms/AppModal';
import PageHeading from '../../atoms/PageHeading';
import SearchBar from '../../molecules/SearchBar';
import RowActions from '../../molecules/RowActions';
import StatusTag from '../../atoms/StatusTag';
import DataTable from '../DataTable';
import useServerTableQuery from '../../../hooks/useServerTableQuery';
import { fetchAppUsers, updateAppUserStatus } from '../../../api/adminUsers.api';

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blocked', value: 'blocked' },
];

const PROVIDER_OPTIONS = [
    { label: 'App', value: 'app' },
    { label: 'Google', value: 'google' },
];

const ProviderTag = ({ provider }) => (
    <Tag color={provider === 'google' ? 'blue' : 'default'} className="capitalize">
        {provider === 'google' ? 'Google' : 'App'}
    </Tag>
);

const toRow = (user) => ({ ...user, joinedDate: user.createdAt?.slice(0, 10) });

export default function AppUsersTable() {
    const serverQuery = useServerTableQuery((params) =>
        fetchAppUsers(params).then((data) => ({ ...data, items: data.items.map(toRow) }))
    );

    const users = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;

    const [viewing, setViewing] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const openEdit = (user) => {
        setEditing(user);
        form.setFieldsValue({ status: user.status });
    };

    const handleSaveEdit = async () => {
        const values = await form.validateFields();

        try {
            await updateAppUserStatus(editing.id, values.status);
            serverQuery.refetch();
            message.success('User status updated');
            setEditing(null);
        } catch {
            message.error('Failed to update user status');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Phone', dataIndex: 'phone' },
        {
            title: 'Joined Date',
            dataIndex: 'joinedDate',
        },
        {
            title: 'Login Via',
            dataIndex: 'provider',
            filters: PROVIDER_OPTIONS.map(({ label, value }) => ({ text: label, value })),
            filteredValue: [serverQuery.filters.provider].filter(Boolean),
            render: (provider) => <ProviderTag provider={provider} />,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: STATUS_OPTIONS.map(({ label, value }) => ({ text: label, value })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions onView={() => setViewing(record)} onEdit={() => openEdit(record)} />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="App Users"
                actions={<SearchBar value={searchText} onChange={setSearchText} placeholder="Search users..." />}
            />
            <DataTable
                columns={columns}
                data={users}
                loading={serverQuery.loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal open={!!viewing} title="User Details" onCancel={() => setViewing(null)} footer={null}>
                {viewing && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Name">{viewing.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewing.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{viewing.phone || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Joined Date">{viewing.joinedDate}</Descriptions.Item>
                        <Descriptions.Item label="Login Via"><ProviderTag provider={viewing.provider} /></Descriptions.Item>
                        <Descriptions.Item label="Status"><StatusTag status={viewing.status} /></Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <Modal
                open={!!editing}
                title="Update User Status"
                onCancel={() => setEditing(null)}
                onOk={handleSaveEdit}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select options={STATUS_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
