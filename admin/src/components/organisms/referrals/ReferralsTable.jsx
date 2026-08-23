import { useState } from 'react';
import { Descriptions, Form, Select, InputNumber, Input, Upload, Image, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeading from '../../atoms/PageHeading';
import SearchBar from '../../molecules/SearchBar';
import RowActions from '../../molecules/RowActions';
import StatusTag from '../../atoms/StatusTag';
import Modal from '../../atoms/AppModal';
import DataTable from '../DataTable';
import useServerTableQuery from '../../../hooks/useServerTableQuery';
import { fetchReferralCommissions, updateReferralCommission } from '../../../api/adminReferrals.api';
import imageUrl from '../../../utils/imageUrl';

const STATUS_OPTIONS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Sent', value: 'sent' },
];

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const BooleanTag = ({ value }) => (
    <Tag color={value ? 'green' : 'default'}>{value ? 'Yes' : 'No'}</Tag>
);

const toRow = (r) => ({
    ...r,
    referrerName: r.referrer?.name,
    referrerEmail: r.referrer?.email,
    referredName: r.referredUser?.name,
    referredEmail: r.referredUser?.email,
    joinedDate: r.referredUser?.joinedAt?.slice(0, 10),
});

export default function ReferralsTable() {
    const serverQuery = useServerTableQuery((params) =>
        fetchReferralCommissions(params).then((data) => ({ ...data, items: data.items.map(toRow) }))
    );

    const referrals = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;
    const [saving, setSaving] = useState(false);

    const [viewing, setViewing] = useState(null);
    const [editing, setEditing] = useState(null);
    const [proofFileList, setProofFileList] = useState([]);
    const [form] = Form.useForm();

    const openEdit = (record) => {
        setEditing(record);
        setProofFileList([]);
        form.setFieldsValue({ status: record.status, amount: record.amount, notes: record.notes });
    };

    const handleSaveEdit = async () => {
        const values = await form.validateFields();

        setSaving(true);
        try {
            const proofScreenshot = proofFileList[0]?.originFileObj;
            await updateReferralCommission(editing.id, { ...values, proofScreenshot });
            serverQuery.refetch();
            message.success('Referral commission updated');
            setEditing(null);
        } catch (err) {
            message.error(apiError(err, 'Failed to update referral commission'));
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: 'Referrer',
            key: 'referrer',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.referrerName}</div>
                    <div className="text-xs text-gray-400">{record.referrerEmail}</div>
                </div>
            ),
        },
        {
            title: 'Referred User',
            key: 'referredUser',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.referredName}</div>
                    <div className="text-xs text-gray-400">{record.referredEmail}</div>
                </div>
            ),
        },
        { title: 'Joined Date', dataIndex: 'joinedDate' },
        {
            title: 'Consultation Booked',
            dataIndex: 'consultationBooked',
            render: (value) => <BooleanTag value={value} />,
        },
        {
            title: 'Product Bought',
            dataIndex: 'productBought',
            render: (value) => <BooleanTag value={value} />,
        },
        {
            title: 'Commission Status',
            dataIndex: 'status',
            filters: STATUS_OPTIONS.map(({ label, value }) => ({ text: label, value })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (amount) => (amount != null ? amount : <span className="text-gray-400">—</span>),
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
                title="Referral Management"
                subtitle="Track who referred whom and manage commission payouts"
                actions={<SearchBar value={searchText} onChange={setSearchText} placeholder="Search referrals..." />}
            />
            <DataTable
                columns={columns}
                data={referrals}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal open={!!viewing} title="Referral Details" onCancel={() => setViewing(null)} footer={null}>
                {viewing && (
                    <>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Referrer">
                                {viewing.referrerName} ({viewing.referrerEmail})
                            </Descriptions.Item>
                            <Descriptions.Item label="Referred User">
                                {viewing.referredName} ({viewing.referredEmail})
                            </Descriptions.Item>
                            <Descriptions.Item label="Joined Date">{viewing.joinedDate}</Descriptions.Item>
                            <Descriptions.Item label="Consultation Booked">
                                <BooleanTag value={viewing.consultationBooked} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Product Bought">
                                <BooleanTag value={viewing.productBought} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <StatusTag status={viewing.status} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Amount">{viewing.amount ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Sent At">{viewing.sentAt || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Notes">{viewing.notes || '—'}</Descriptions.Item>
                        </Descriptions>
                        {viewing.proofScreenshot && (
                            <div className="mt-4">
                                <div className="text-sm text-gray-500 mb-2">Proof of Payment</div>
                                <Image src={imageUrl(viewing.proofScreenshot)} width={160} className="rounded-lg" />
                            </div>
                        )}
                    </>
                )}
            </Modal>

            <Modal
                open={!!editing}
                title="Update Commission"
                onCancel={() => setEditing(null)}
                onOk={handleSaveEdit}
                okText="Save"
                confirmLoading={saving}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select options={STATUS_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="amount" label="Amount Sent">
                        <InputNumber className="w-full" min={0} placeholder="e.g. 1500" />
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={3} placeholder="Optional notes (e.g. payment method)" />
                    </Form.Item>
                    <Form.Item label="Proof Screenshot (optional)">
                        {editing?.proofScreenshot && proofFileList.length === 0 && (
                            <div className="mb-2">
                                <Image src={imageUrl(editing.proofScreenshot)} width={100} className="rounded-lg" />
                            </div>
                        )}
                        <Upload
                            listType="picture-card"
                            fileList={proofFileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setProofFileList(fileList.slice(-1))}
                            accept="image/*"
                            maxCount={1}
                        >
                            {proofFileList.length >= 1 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div className="mt-1 text-xs">Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
