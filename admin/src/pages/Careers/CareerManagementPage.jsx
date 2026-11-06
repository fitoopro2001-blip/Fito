import { useState } from 'react';
import { Descriptions, Button, message, Typography } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { PlusOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import RowActions from '../../components/molecules/RowActions';
import StatusTag from '../../components/atoms/StatusTag';
import DataTable from '../../components/organisms/DataTable';
import CareerFormDrawer from '../../components/organisms/careers/CareerFormDrawer';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import {
    fetchCareers,
    createCareer as createCareerApi,
    updateCareer as updateCareerApi,
    deleteCareer as deleteCareerApi,
} from '../../api/adminCareers.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

export default function CareerManagementPage() {
    const serverQuery = useServerTableQuery(fetchCareers);

    const careers = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;
    const [saving, setSaving] = useState(false);

    const [viewing, setViewing] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCareer, setEditingCareer] = useState(null);

    const openCreate = () => {
        setEditingCareer(null);
        setDrawerOpen(true);
    };

    const openEdit = (career) => {
        setEditingCareer(career);
        setDrawerOpen(true);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            if (editingCareer) {
                await updateCareerApi(editingCareer.id, values);
                message.success('Job posting updated');
            } else {
                await createCareerApi(values);
                message.success('Job posting created');
            }
            serverQuery.refetch();
            setDrawerOpen(false);
        } catch (err) {
            message.error(apiError(err, 'Failed to save job posting'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCareerApi(id);
            serverQuery.refetch();
            message.success('Job posting deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete job posting'));
        }
    };

    const columns = [
        { title: 'Title', dataIndex: 'title' },
        { title: 'Description', dataIndex: 'description', ellipsis: true },
        { title: 'Contact Email', dataIndex: 'email' },
        {
            title: 'Status',
            dataIndex: 'isOpen',
            filters: [
                { text: 'Open', value: true },
                { text: 'Closed', value: false },
            ],
            render: (isOpen) => <StatusTag status={isOpen ? 'open' : 'closed'} />,
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
                title="Career Management"
                subtitle="Publish and manage open job postings"
                actions={
                    <>
                        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search job postings..." />
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            New Job Posting
                        </Button>
                    </>
                }
            />

            <DataTable
                columns={columns}
                data={careers}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!viewing}
                title="Job Posting Details"
                onCancel={() => setViewing(null)}
                footer={null}
                centered
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
            >
                {viewing && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Title">{viewing.title}</Descriptions.Item>
                        <Descriptions.Item label="Description">
                            <Typography.Paragraph className="!mb-0 whitespace-pre-wrap">
                                {viewing.description}
                            </Typography.Paragraph>
                        </Descriptions.Item>
                        <Descriptions.Item label="Application Link">
                            <a href={viewing.link} target="_blank" rel="noreferrer">
                                {viewing.link}
                            </a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Contact Email">{viewing.email}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <StatusTag status={viewing.isOpen ? 'open' : 'closed'} />
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <CareerFormDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleSubmit}
                initialValues={editingCareer}
                saving={saving}
            />
        </div>
    );
}
