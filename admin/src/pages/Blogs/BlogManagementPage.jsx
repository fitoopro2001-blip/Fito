import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Descriptions, Image, Button, message } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { PlusOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import RowActions from '../../components/molecules/RowActions';
import StatusTag from '../../components/atoms/StatusTag';
import DataTable from '../../components/organisms/DataTable';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import { BLOG_CATEGORIES } from '../../data/blogs';
import imageUrl from '../../utils/imageUrl';
import { ROUTES, blogEditPath } from '../../constants/routes';
import { fetchBlogs, deleteBlog as deleteBlogApi } from '../../api/adminBlogs.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

export default function BlogManagementPage() {
    const navigate = useNavigate();
    const serverQuery = useServerTableQuery(fetchBlogs);

    const blogs = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;

    const [viewing, setViewing] = useState(null);

    const handleDelete = async (id) => {
        try {
            await deleteBlogApi(id);
            serverQuery.refetch();
            message.success('Blog deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete blog'));
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            render: (image) => (
                <Image src={imageUrl(image)} width={48} height={48} className="rounded-lg object-cover" fallback="" />
            ),
        },
        { title: 'Title', dataIndex: 'title' },
        {
            title: 'Category',
            dataIndex: 'category',
            filters: BLOG_CATEGORIES.map((c) => ({ text: c, value: c })),
            filteredValue: [serverQuery.filters.category].filter(Boolean),
        },
        { title: 'Author', dataIndex: 'author' },
        {
            title: 'Date',
            dataIndex: 'date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }],
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions
                    onView={() => setViewing(record)}
                    onEdit={() => navigate(blogEditPath(record.id))}
                    onDelete={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Blog Management"
                subtitle="Manage articles and posts"
                actions={
                    <>
                        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search blogs..." />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.BLOG_ADD)}>
                            Add Blog
                        </Button>
                    </>
                }
            />

            <DataTable
                columns={columns}
                data={blogs}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!viewing}
                title="Blog Details"
                onCancel={() => setViewing(null)}
                footer={null}
                centered
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
            >
                {viewing && (
                    <div>
                        <Image
                            src={imageUrl(viewing.image)}
                            width="100%"
                            height={180}
                            className="rounded-lg object-cover mb-4"
                            fallback=""
                        />
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Title">{viewing.title}</Descriptions.Item>
                            <Descriptions.Item label="Slug">{viewing.slug}</Descriptions.Item>
                            <Descriptions.Item label="Category">{viewing.category}</Descriptions.Item>
                            <Descriptions.Item label="Author">{viewing.author}</Descriptions.Item>
                            <Descriptions.Item label="Date">{viewing.date}</Descriptions.Item>
                            <Descriptions.Item label="Read Time">{viewing.readTime}</Descriptions.Item>
                            <Descriptions.Item label="Status"><StatusTag status={viewing.status} /></Descriptions.Item>
                            <Descriptions.Item label="Excerpt">{viewing.excerpt}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
}
