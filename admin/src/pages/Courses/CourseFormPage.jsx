import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Image, Upload, Card, Row, Col, Result, Spin, message } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, MinusCircleOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import { ROUTES } from '../../constants/routes';
import { COURSE_CATEGORIES, COURSE_STATUSES } from '../../constants/courses';
import imageUrl from '../../utils/imageUrl';
import {
    fetchCourse,
    createCourse as createCourseApi,
    updateCourse as updateCourseApi,
} from '../../api/adminCourses.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const NEW_COURSE_DEFAULTS = { status: 'draft', sortOrder: 0, outcomes: [''], curriculum: [{}] };

export default function CourseFormPage() {
    const { id } = useParams();
    // Remounts (resetting all local state) whenever the id changes, instead
    // of syncing that reset through an effect.
    return <CourseFormPageInner key={id} id={id} />;
}

function CourseFormPageInner({ id }) {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const isEdit = Boolean(id);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [file, setFile] = useState(null);

    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;
        fetchCourse(id)
            .then((data) => {
                if (cancelled) return;
                setCourse(data);
                form.setFieldsValue(data);
            })
            .catch(() => {
                if (!cancelled) setNotFound(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id, isEdit, form]);

    if (notFound) {
        return (
            <Result
                status="404"
                title="Course not found"
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTES.COURSES)}>
                        Back to Courses
                    </Button>
                }
            />
        );
    }

    const handleFinish = async (values) => {
        setSaving(true);
        try {
            const payload = {
                ...values,
                // A cleared "actual price" means "no discount".
                originalPrice: values.originalPrice ?? 0,
                image: file?.originFileObj,
            };
            if (isEdit) {
                await updateCourseApi(course.id, payload);
                message.success('Course updated');
            } else {
                await createCourseApi(payload);
                message.success('Course created');
            }
            navigate(ROUTES.COURSES);
        } catch (err) {
            message.error(apiError(err, 'Failed to save course'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeading
                title={isEdit ? 'Edit Course' : 'Add Course'}
                subtitle={isEdit ? 'Update this course' : 'Create a new academy course'}
                actions={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.COURSES)}>
                        Back to Courses
                    </Button>
                }
            />

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spin />
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={isEdit ? {} : NEW_COURSE_DEFAULTS}
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={14}>
                            <Card title="Course Details" className="mb-6">
                                <Row gutter={16}>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="code" label="Course ID">
                                            <Input placeholder="C07" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={16}>
                                        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                                            <Input placeholder="Applied Sports Nutrition" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    name="slug"
                                    label="URL Slug"
                                    tooltip="Leave blank to generate one from the title. Changing it changes the course's public link."
                                >
                                    <Input placeholder="applied-sports-nutrition" />
                                </Form.Item>

                                <Form.Item name="summary" label="Short Summary" rules={[{ required: true }]}>
                                    <Input.TextArea rows={2} placeholder="One line shown on the course card" />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col xs={24} sm={14}>
                                        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                            <Select options={COURSE_CATEGORIES.map((c) => ({ label: c, value: c }))} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={10}>
                                        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                            <Select
                                                options={COURSE_STATUSES.map((s) => ({
                                                    label: s.replace(/^./, (c) => c.toUpperCase()),
                                                    value: s,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={12} sm={8}>
                                        <Form.Item name="durationWeeks" label="Duration (weeks)" rules={[{ required: true }]}>
                                            <InputNumber min={1} className="!w-full" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={8}>
                                        <Form.Item name="hours" label="Teaching Hours" rules={[{ required: true }]}>
                                            <InputNumber min={1} className="!w-full" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={8}>
                                        <Form.Item
                                            name="sortOrder"
                                            label="Display Order"
                                            tooltip="Lower numbers are listed first."
                                        >
                                            <InputNumber min={0} className="!w-full" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="schedule" label="Schedule">
                                    <Input placeholder="8 onsite classes, 2 hours each" />
                                </Form.Item>
                                <Form.Item name="batchGuidance" label="Batch Size">
                                    <Input placeholder="Recommended 12 to 15 learners; maximum 20" />
                                </Form.Item>
                                <Form.Item name="venue" label="Venue">
                                    <Input placeholder="FITOO Office, Moon Market, Allama Iqbal Town, Lahore" />
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Card title="Pricing (PKR)" className="mb-6">
                                <Form.Item
                                    name="price"
                                    label="Discounted Price"
                                    tooltip="The amount learners actually pay."
                                    rules={[{ required: true }]}
                                >
                                    <InputNumber min={0} prefix="PKR" className="!w-full" />
                                </Form.Item>
                                <Form.Item
                                    name="originalPrice"
                                    label="Actual Price"
                                    tooltip="Shown struck through beside the discounted price. Leave blank for no discount."
                                    dependencies={['price']}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator: (_, value) =>
                                                !value || value > (getFieldValue('price') ?? 0)
                                                    ? Promise.resolve()
                                                    : Promise.reject(
                                                          new Error('Must be higher than the discounted price')
                                                      ),
                                        }),
                                    ]}
                                >
                                    <InputNumber min={0} prefix="PKR" className="!w-full" />
                                </Form.Item>
                            </Card>

                            <Card title="Course Image" className="mt-6!">
                                {course?.image && !file && (
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500 mb-2">Current Image</div>
                                        <Image
                                            src={imageUrl(course.image)}
                                            width={120}
                                            height={90}
                                            className="rounded-lg object-cover"
                                            fallback=""
                                        />
                                    </div>
                                )}
                                <Form.Item label="Upload" tooltip="Optional — courses without an image show a branded placeholder.">
                                    <Upload
                                        listType="picture-card"
                                        fileList={file ? [file] : []}
                                        beforeUpload={() => false}
                                        onChange={({ fileList }) => setFile(fileList[fileList.length - 1] ?? null)}
                                        onRemove={() => setFile(null)}
                                        accept="image/*"
                                        maxCount={1}
                                    >
                                        {file ? null : (
                                            <div>
                                                <PlusOutlined />
                                                <div className="mt-1 text-xs">Upload</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Course Content" className="mt-6!">
                        <Form.Item name="overview" label="Overview">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item name="audience" label="Who It Is For">
                            <Input.TextArea rows={2} />
                        </Form.Item>

                        <Form.Item label="Learning Outcomes">
                            <Form.List name="outcomes">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name }) => (
                                            <div key={key} className="flex items-start gap-2 mb-2">
                                                <Form.Item name={name} className="!mb-0 flex-1">
                                                    <Input placeholder="What learners will be able to do" />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </div>
                                        ))}
                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => add('')}>
                                            Add Outcome
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>

                        <Form.Item
                            label="Weekly Curriculum"
                            tooltip="Weeks are numbered automatically in the order listed."
                        >
                            <Form.List name="curriculum">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name }, index) => (
                                            <div key={key} className="flex items-start gap-2 mb-2">
                                                <span className="w-16 shrink-0 pt-1.5 text-sm text-gray-500">
                                                    Week {index + 1}
                                                </span>
                                                <Form.Item name={[name, 'topic']} className="!mb-0 flex-1">
                                                    <Input placeholder="Topic" />
                                                </Form.Item>
                                                <Form.Item name={[name, 'practical']} className="!mb-0 flex-1">
                                                    <Input placeholder="Practical work" />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </div>
                                        ))}
                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({})}>
                                            Add Week
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>

                        <Form.Item name="inclusions" label="Included Materials and Experience">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item name="assessment" label="Assessment">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item name="disclaimer" label="Scope and Important Details">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button onClick={() => navigate(ROUTES.COURSES)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={saving}>
                            {isEdit ? 'Save Changes' : 'Create Course'}
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    );
}
