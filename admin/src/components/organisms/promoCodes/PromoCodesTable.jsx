import { useState } from 'react';
import dayjs from 'dayjs';
import { Form, InputNumber, DatePicker, Select, message } from 'antd';
import PageHeading from '../../atoms/PageHeading';
import SearchBar from '../../molecules/SearchBar';
import RowActions from '../../molecules/RowActions';
import StatusTag from '../../atoms/StatusTag';
import Modal from '../../atoms/AppModal';
import DataTable from '../DataTable';
import useServerTableQuery from '../../../hooks/useServerTableQuery';
import { fetchPromoCodes, updatePromoCode } from '../../../api/adminPromoCodes.api';
import PromoSettingsCard from './PromoSettingsCard';

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Used', value: 'used' },
    { label: 'Expired', value: 'expired' },
    { label: 'Revoked', value: 'revoked' },
];

// Only these two are admin-settable — `used` is earned by a real redemption
// and `expired` follows from the expiry date (see adminPromoCodes.controller).
const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter(({ value }) =>
    ['active', 'revoked'].includes(value)
);

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const formatDate = (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '—');

export default function PromoCodesTable() {
    const serverQuery = useServerTableQuery(fetchPromoCodes);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            discountPercent: record.discountPercent,
            expiresAt: dayjs(record.expiresAt),
            status: record.status === 'expired' ? 'active' : record.status,
        });
    };

    const handleSaveEdit = async () => {
        const values = await form.validateFields();
        setSaving(true);
        try {
            await updatePromoCode(editing.id, {
                discountPercent: values.discountPercent,
                expiresAt: values.expiresAt.toISOString(),
                status: values.status,
            });
            serverQuery.refetch();
            message.success('Promo code updated');
            setEditing(null);
        } catch (err) {
            message.error(apiError(err, 'Failed to update promo code'));
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            render: (code) => <span className="font-mono tracking-wider">{code}</span>,
        },
        {
            title: 'Earned By',
            key: 'owner',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.owner?.name ?? '—'}</div>
                    <div className="text-xs text-gray-400">{record.owner?.email}</div>
                </div>
            ),
        },
        {
            title: 'Referred Signup',
            key: 'issuedFor',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.issuedFor?.name ?? '—'}</div>
                    <div className="text-xs text-gray-400">{record.issuedFor?.email}</div>
                </div>
            ),
        },
        {
            title: 'Discount',
            dataIndex: 'discountPercent',
            render: (percent) => `${percent}%`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: STATUS_OPTIONS.map(({ label, value }) => ({ text: label, value })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        { title: 'Expires', dataIndex: 'expiresAt', render: formatDate },
        {
            title: 'Redeemed',
            key: 'redeemed',
            render: (_, record) =>
                record.usedAt ? (
                    <div>
                        <div>{formatDate(record.usedAt)}</div>
                        {record.usedOnOrder && (
                            <div className="text-xs text-gray-400">#{record.usedOnOrder.orderNumber}</div>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            title: 'Actions',
            key: 'actions',
            // A redeemed code is final, so there's nothing to edit on one.
            render: (_, record) =>
                record.status === 'used' ? (
                    <span className="text-gray-400">—</span>
                ) : (
                    <RowActions onEdit={() => openEdit(record)} />
                ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Promo Code Management"
                subtitle="Referral rewards — one single-use code per verified signup"
                actions={
                    <SearchBar
                        value={serverQuery.searchInput}
                        onChange={serverQuery.setSearchInput}
                        placeholder="Search code, referrer or signup..."
                    />
                }
            />

            <PromoSettingsCard />

            <DataTable
                columns={columns}
                data={serverQuery.items}
                loading={serverQuery.loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!editing}
                title={`Edit ${editing?.code ?? 'Promo Code'}`}
                onCancel={() => setEditing(null)}
                onOk={handleSaveEdit}
                okText="Save"
                confirmLoading={saving}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="discountPercent"
                        label="Discount Percent"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <InputNumber className="w-full" min={0} max={100} addonAfter="%" />
                    </Form.Item>
                    <Form.Item
                        name="expiresAt"
                        label="Expires On"
                        rules={[{ required: true, message: 'Required' }]}
                        extra="Pushing this forward brings an expired code back into play."
                    >
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select options={EDITABLE_STATUS_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
