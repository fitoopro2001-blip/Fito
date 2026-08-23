import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Select, DatePicker, message } from 'antd';
import Modal from '../../atoms/AppModal';
import dayjs from 'dayjs';
import SearchBar from '../../molecules/SearchBar';
import RowActions from '../../molecules/RowActions';
import StatusTag from '../../atoms/StatusTag';
import DataTable from '../DataTable';
import useServerTableQuery from '../../../hooks/useServerTableQuery';
import { CONSULTATION_GOALS, CONSULTATION_STATUSES } from '../../../constants/consultationGoals';
import { consultationDetailPath } from '../../../constants/routes';
import { useAuth } from '../../../context/AuthContext';
import { fetchConsultations, updateConsultation, deleteConsultation } from '../../../api/consultations.api';

const toRow = (c) => ({ ...c, user: c.personalInfo?.fullName });

// `goal` fixes this table to one goal category (used by the per-goal tabs);
// omit it for the "All" tab, where the Goal column's own filter applies instead.
export default function ConsultationTable({ goal, showGoal = false }) {
    const { isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const serverQuery = useServerTableQuery((params) =>
        fetchConsultations({ ...params, goal: goal ?? params.goal }).then((data) => ({
            ...data,
            items: data.items.map(toRow),
        }))
    );

    const data = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;

    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({ status: record.status, assignedDate: dayjs(record.assignedDate) });
    };

    const handleSaveEdit = async () => {
        const values = await form.validateFields();
        const assignedDate = values.assignedDate.format('YYYY-MM-DD');

        try {
            await updateConsultation(editing.id, { status: values.status, assignedDate });
            serverQuery.refetch();
            message.success('Consultation updated');
            setEditing(null);
        } catch {
            message.error('Failed to update consultation');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteConsultation(id);
            serverQuery.refetch();
            message.success('Consultation deleted');
        } catch {
            message.error('Failed to delete consultation');
        }
    };

    // Deletion is super-admin-only.
    const canDelete = isSuperAdmin;

    const columns = [
        { title: 'Consultation ID', dataIndex: 'id' },
        { title: 'User', dataIndex: 'user' },
        ...(showGoal
            ? [
                  {
                      title: 'Goal',
                      dataIndex: 'goal',
                      filters: CONSULTATION_GOALS.map((g) => ({ text: g.title, value: g.id })),
                      filteredValue: [serverQuery.filters.goal].filter(Boolean),
                      render: (goalId) => {
                          const goalConfig = CONSULTATION_GOALS.find((g) => g.id === goalId);
                          return (
                              <span>
                                  {goalConfig?.icon} {goalConfig?.title ?? goalId}
                              </span>
                          );
                      },
                  },
              ]
            : []),
        {
            title: 'Status',
            dataIndex: 'status',
            filters: CONSULTATION_STATUSES.map((s) => ({ text: s, value: s })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Assigned Date',
            dataIndex: 'assignedDate',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions
                    onView={() => navigate(consultationDetailPath(record.id))}
                    onEdit={() => openEdit(record)}
                    onDelete={canDelete ? () => handleDelete(record.id) : undefined}
                />
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-end mb-4">
                <SearchBar value={searchText} onChange={setSearchText} placeholder="Search consultations..." />
            </div>
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!editing}
                title="Edit Consultation"
                onCancel={() => setEditing(null)}
                onOk={handleSaveEdit}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select options={CONSULTATION_STATUSES.map((s) => ({ label: s, value: s }))} />
                    </Form.Item>
                    <Form.Item name="assignedDate" label="Assigned Date" rules={[{ required: true }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
