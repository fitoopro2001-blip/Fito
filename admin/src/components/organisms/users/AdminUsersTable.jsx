import { useState } from 'react';
import { Descriptions, Form, Select, message } from 'antd';
import Modal from '../../atoms/AppModal';
import PageHeading from '../../atoms/PageHeading';
import SearchBar from '../../molecules/SearchBar';
import RowActions from '../../molecules/RowActions';
import StatusTag from '../../atoms/StatusTag';
import DataTable from '../DataTable';
import useServerTableQuery from '../../../hooks/useServerTableQuery';
import { ROLE_LABELS, ROLES } from '../../../constants/roles';
import { ADMIN_STATUS, ADMIN_STATUS_LABELS } from '../../../constants/adminStatus';
import { fetchAdmins, updateAdminStatus } from '../../../api/adminAuth.api';

const STATUS_OPTIONS = Object.values(ADMIN_STATUS).map((value) => ({
    label: ADMIN_STATUS_LABELS[value],
    value,
}));

export default function AdminUsersTable() {
    const serverQuery = useServerTableQuery(fetchAdmins);

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
            await updateAdminStatus(editing.id, values.status);
            serverQuery.refetch();
            message.success('Admin status updated');
            setEditing(null);
        } catch {
            message.error('Failed to update admin status');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Role',
            dataIndex: 'role',
            filters: Object.values(ROLES).map((r) => ({ text: ROLE_LABELS[r], value: r })),
            filteredValue: [serverQuery.filters.role].filter(Boolean),
            render: (role) => ROLE_LABELS[role],
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: STATUS_OPTIONS.map(({ label, value }) => ({ text: label, value })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
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
                title="Admin Users"
                actions={<SearchBar value={searchText} onChange={setSearchText} placeholder="Search admins..." />}
            />
            <DataTable
                columns={columns}
                data={users}
                loading={serverQuery.loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal open={!!viewing} title="Admin User Details" onCancel={() => setViewing(null)} footer={null}>
                {viewing && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Name">{viewing.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewing.email}</Descriptions.Item>
                        <Descriptions.Item label="Role">{ROLE_LABELS[viewing.role]}</Descriptions.Item>
                        <Descriptions.Item label="Status"><StatusTag status={viewing.status} /></Descriptions.Item>
                        <Descriptions.Item label="Created At">{viewing.createdAt}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <Modal
                open={!!editing}
                title="Update Admin Status"
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
