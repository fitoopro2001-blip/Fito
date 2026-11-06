import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, Image, Upload, Card, Row, Col, Result, message } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import RichTextEditor from '../../components/molecules/RichTextEditor';
import BlogFormSkeleton from './BlogFormSkeleton';
import { ROUTES } from '../../constants/routes';
import { BLOG_CATEGORIES } from '../../data/blogs';
import imageUrl from '../../utils/imageUrl';
import { fetchBlog, createBlog as createBlogApi, updateBlog as updateBlogApi } from '../../api/adminBlogs.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const isContentEmpty = (html) => !html || !html.replace(/<[^>]*>/g, '').trim();

export default function BlogFormPage() {
    const { id } = useParams();
    // Remounts (resetting all local state) whenever the id changes, instead
    // of syncing that reset through an effect.
    return <BlogFormPageInner key={id} id={id} />;
}

function BlogFormPageInner({ id }) {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const isEdit = Boolean(id);

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [file, setFile] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;
        fetchBlog(id)
            .then((data) => {
                if (cancelled) return;
                setBlog(data);
                setCurrentImage(data.image);
                form.setFieldsValue({ ...data, metaDescription: data.seo?.metaDescription });
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
                title="Blog post not found"
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTES.BLOGS)}>
                        Back to Blogs
                    </Button>
                }
            />
        );
    }

    const handleFinish = async (values) => {
        setSaving(true);
        try {
            const payload = { ...values, image: file?.originFileObj };
            if (isEdit) {
                await updateBlogApi(blog.id, payload);
                message.success('Blog updated');
            } else {
                await createBlogApi(payload);
                message.success('Blog created');
            }
            navigate(ROUTES.BLOGS);
        } catch (err) {
            message.error(apiError(err, 'Failed to save blog'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeading
                title={isEdit ? 'Edit Blog' : 'Add Blog'}
                subtitle={isEdit ? 'Update this article' : 'Write a new article'}
                actions={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.BLOGS)}>
                        Back to Blogs
                    </Button>
                }
            />

            {loading ? (
                <BlogFormSkeleton />
            ) : (
                <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{}}>
                    <Row gutter={24}>
                        <Col xs={24} lg={14}>
                            <Card title="Post Details" className="mb-6">
                                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                                    <Input placeholder="How Much Protein Do You Need?" />
                                </Form.Item>

                                <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                    <Select options={BLOG_CATEGORIES.map((c) => ({ label: c, value: c }))} />
                                </Form.Item>

                                <Form.Item name="author" label="Author" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                            <Input placeholder="YYYY-MM-DD" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="readTime" label="Read Time">
                                            <Input placeholder="5 min read" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                    <Select
                                        options={[
                                            { label: 'Published', value: 'published' },
                                            { label: 'Draft', value: 'draft' },
                                        ]}
                                    />
                                </Form.Item>

                                <Form.Item name="excerpt" label="Excerpt" rules={[{ required: true }]}>
                                    <Input.TextArea rows={3} />
                                </Form.Item>

                                <Form.Item
                                    name="metaDescription"
                                    label="Meta Description"
                                    tooltip="Leave blank to auto-generate one from the post details."
                                >
                                    <Input.TextArea
                                        rows={3}
                                        maxLength={160}
                                        showCount
                                        placeholder="Auto-generated if left blank"
                                    />
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Card title="Cover Image" className="mb-6">
                                {currentImage && !file && (
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500 mb-2">Current Cover</div>
                                        <Image
                                            src={imageUrl(currentImage)}
                                            width={120}
                                            height={90}
                                            className="rounded-lg object-cover"
                                            fallback=""
                                        />
                                    </div>
                                )}
                                <Form.Item
                                    label="Upload"
                                    tooltip="Crop to 16:10 — this is exactly how it will appear on the blog."
                                >
                                    <ImgCrop aspect={16 / 10} rotationSlider quality={1}>
                                        <Upload
                                            listType="picture-card"
                                            fileList={file ? [file] : []}
                                            // See ProductFormPage: beforeUpload={() => false} would make
                                            // AntD drop the cropped file and keep the original instead.
                                            customRequest={({ onSuccess }) => onSuccess?.('ok')}
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
                                    </ImgCrop>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Body" className="my-6!">
                        <Form.Item
                            name="content"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        isContentEmpty(value)
                                            ? Promise.reject(new Error('Body is required'))
                                            : Promise.resolve(),
                                },
                            ]}
                        >
                            <RichTextEditor placeholder="Write the article body..." />
                        </Form.Item>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button onClick={() => navigate(ROUTES.BLOGS)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={saving}>
                            {isEdit ? 'Save Changes' : 'Create Blog'}
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    );
}
