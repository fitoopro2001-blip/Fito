import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Descriptions, Button, Typography, message } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import RowActions from '../../components/molecules/RowActions';
import StatusTag from '../../components/atoms/StatusTag';
import DataTable from '../../components/organisms/DataTable';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import { COURSE_CATEGORIES, COURSE_STATUSES, formatPKR } from '../../constants/courses';
import { ROUTES, courseEditPath } from '../../constants/routes';
import { fetchCourses, deleteCourse as deleteCourseApi } from '../../api/adminCourses.api';

const { Text } = Typography;

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

// Charged price, with the actual price struck through beside it when the
// course is discounted.
function CoursePrice({ course }) {
    return (
        <span className="whitespace-nowrap">
            <span className="font-medium">{formatPKR(course.price)}</span>
            {course.originalPrice && (
                <>
                    <Text delete type="secondary" className="ml-2 text-xs">
                        {formatPKR(course.originalPrice)}
                    </Text>
                    <Text type="success" className="ml-2 text-xs">
                        {course.discountPercent}% off
                    </Text>
                </>
            )}
        </span>
    );
}

export default function CourseManagementPage() {
    const navigate = useNavigate();
    const serverQuery = useServerTableQuery(fetchCourses);

    const courses = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;

    const [viewing, setViewing] = useState(null);

    const handleDelete = async (id) => {
        try {
            await deleteCourseApi(id);
            serverQuery.refetch();
            message.success('Course deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete course'));
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'code', render: (code) => code || '—' },
        { title: 'Title', dataIndex: 'title' },
        {
            title: 'Category',
            dataIndex: 'category',
            filters: COURSE_CATEGORIES.map((c) => ({ text: c, value: c })),
            filteredValue: [serverQuery.filters.category].filter(Boolean),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => `${record.durationWeeks} weeks • ${record.hours} hours`,
        },
        {
            title: 'Price',
            key: 'price',
            render: (_, record) => <CoursePrice course={record} />,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: COURSE_STATUSES.map((s) => ({ text: s, value: s })),
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions
                    onView={() => setViewing(record)}
                    onEdit={() => navigate(courseEditPath(record.id))}
                    onDelete={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Course Management"
                subtitle="Manage FITOO Academy courses and their pricing"
                actions={
                    <>
                        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search courses..." />
                        <Button icon={<TeamOutlined />} onClick={() => navigate(ROUTES.COURSE_ENROLLMENTS)}>
                            Enrolments
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.COURSE_ADD)}>
                            Add Course
                        </Button>
                    </>
                }
            />

            <DataTable
                columns={columns}
                data={courses}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={!!viewing}
                title="Course Details"
                onCancel={() => setViewing(null)}
                footer={null}
                width={720}
            >
                {viewing && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="ID">{viewing.code || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Title">{viewing.title}</Descriptions.Item>
                        <Descriptions.Item label="Slug">{viewing.slug}</Descriptions.Item>
                        <Descriptions.Item label="Category">{viewing.category}</Descriptions.Item>
                        <Descriptions.Item label="Price">
                            <CoursePrice course={viewing} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Duration">
                            {viewing.durationWeeks} weeks • {viewing.hours} hours
                        </Descriptions.Item>
                        <Descriptions.Item label="Schedule">{viewing.schedule || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <StatusTag status={viewing.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Summary">{viewing.summary}</Descriptions.Item>
                        <Descriptions.Item label="Overview">{viewing.overview || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Who it is for">{viewing.audience || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Learning Outcomes">
                            {viewing.outcomes.length > 0 ? (
                                <ul className="list-disc pl-5 m-0">
                                    {viewing.outcomes.map((outcome, idx) => (
                                        <li key={idx}>{outcome}</li>
                                    ))}
                                </ul>
                            ) : (
                                '—'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Curriculum">
                            {viewing.curriculum.length > 0 ? (
                                <ol className="list-decimal pl-5 m-0">
                                    {viewing.curriculum.map((row) => (
                                        <li key={row.week}>
                                            {row.topic}
                                            {row.practical && <Text type="secondary"> — {row.practical}</Text>}
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                '—'
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}
