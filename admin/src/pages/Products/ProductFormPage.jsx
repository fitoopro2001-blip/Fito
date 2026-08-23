import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Image,
    Upload,
    Card,
    Row,
    Col,
    Result,
    message,
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import ProductFormSkeleton from './ProductFormSkeleton';
import RichTextEditor from '../../components/molecules/RichTextEditor';
import { ROUTES } from '../../constants/routes';
import useCategories from '../../hooks/useCategories';
import imageUrl from '../../utils/imageUrl';
import {
    fetchProduct,
    createProduct as createProductApi,
    updateProduct as updateProductApi,
} from '../../api/adminProducts.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

// RichTextEditor's "empty" HTML is `<p></p>`, so a plain required rule
// wouldn't catch it — strip tags before checking for content.
const isContentEmpty = (html) => !html || !html.replace(/<[^>]*>/g, '').trim();

export default function ProductFormPage() {
    const { id } = useParams();
    // Remounts (resetting all local state) whenever the id changes, instead
    // of syncing that reset through an effect.
    return <ProductFormPageInner key={id} id={id} />;
}

function ProductFormPageInner({ id }) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { categories } = useCategories();
    const activeCategories = categories.filter((c) => c.status === 'active');

    const isEdit = Boolean(id);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [files, setFiles] = useState([]);
    const [keptImages, setKeptImages] = useState([]);
    const priceValue = Form.useWatch('price', form);
    const discountValue = Form.useWatch('discountPercent', form);
    const finalPriceValue =
        typeof priceValue === 'number' && discountValue > 0
            ? Math.round(priceValue * (1 - discountValue / 100) * 100) / 100
            : priceValue;

    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;
        fetchProduct(id)
            .then((data) => {
                if (cancelled) return;
                setProduct(data);
                setKeptImages(data.images ?? []);
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
                title="Product not found"
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTES.PRODUCTS)}>
                        Back to Products
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
                images: files.map((f) => f.originFileObj).filter(Boolean),
                existingImages: isEdit ? keptImages : undefined,
            };
            if (isEdit) {
                await updateProductApi(product.id, payload);
                message.success('Product updated');
            } else {
                await createProductApi(payload);
                message.success('Product created');
            }
            navigate(ROUTES.PRODUCTS);
        } catch (err) {
            message.error(apiError(err, 'Failed to save product'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeading
                title={isEdit ? 'Edit Product' : 'Add Product'}
                subtitle={isEdit ? 'Update product details' : "Add a new product to your store"}
                actions={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.PRODUCTS)}>
                        Back to Products
                    </Button>
                }
            />

            {loading ? (
                <ProductFormSkeleton />
            ) : (
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    discountPercent: 0,
                    nutritionFacts: [],
                    variants: [],
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={14}>
                        <Card title="Product Details" className="mb-6">
                            <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                                <Input placeholder="Whey Protein Isolate" />
                            </Form.Item>

                            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Select a category"
                                    options={activeCategories.map((c) => ({ label: c.name, value: c.slug }))}
                                    notFoundContent="No active categories — add one under Category Management"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="price" label="Price (Rs.)" rules={[{ required: true }]}>
                                        <InputNumber min={0} step={0.01} className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="discountPercent"
                                        label="Discount (%)"
                                        tooltip="Shown as a struck-through original price on the storefront."
                                    >
                                        <InputNumber min={0} max={100} step={1} className="w-full" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {typeof priceValue === 'number' && (
                                <div className="-mt-2 mb-4 text-sm">
                                    {discountValue > 0 ? (
                                        <>
                                            <span className="text-gray-400 line-through mr-2">
                                                {`Rs. ${priceValue.toFixed(2)}`}
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                {`Rs. ${finalPriceValue.toFixed(2)}`}
                                            </span>
                                            <span className="ml-2 text-gray-500">{`(${discountValue}% off)`}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">{`Final Price: Rs. ${priceValue.toFixed(2)}`}</span>
                                    )}
                                </div>
                            )}

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
                                        <InputNumber min={0} className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                        <Select
                                            options={[
                                                { label: 'Published', value: 'published' },
                                                { label: 'Draft', value: 'draft' },
                                                { label: 'Out of Stock', value: 'out_of_stock' },
                                                { label: 'Coming Soon', value: 'coming_soon' },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            isContentEmpty(value)
                                                ? Promise.reject(new Error('Description is required'))
                                                : Promise.resolve(),
                                    },
                                ]}
                            >
                                <RichTextEditor placeholder="Describe the product..." />
                            </Form.Item>
                        </Card>

                        <Card
                            title="SEO"
                            extra={<span className="text-xs text-gray-400">Shown in search results and social previews</span>}
                            className="my-6!"
                        >
                            <Form.Item
                                name="metaDescription"
                                label="Meta Description"
                                tooltip="Leave blank to auto-generate one from the product details."
                            >
                                <Input.TextArea rows={3} maxLength={160} showCount placeholder="Auto-generated if left blank" />
                            </Form.Item>
                        </Card>

                        <Card
                            title="Variants"
                            extra={<span className="text-xs text-gray-400">Optional — e.g. size or flavor options</span>}
                            className="mb-6"
                        >
                            <Form.List name="variants">
                                {(fields, { add, remove }) => (
                                    <div className="flex flex-col gap-2">
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="flex gap-2 items-start">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    rules={[{ required: true, message: 'Name required' }]}
                                                    className="flex-1 mb-2"
                                                >
                                                    <Input placeholder="1kg - Chocolate" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'sku']} className="w-32 mb-2">
                                                    <Input placeholder="SKU" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'price']} className="w-28 mb-2">
                                                    <InputNumber min={0} step={0.01} className="w-full" placeholder="Price" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'stock']} className="w-24 mb-2">
                                                    <InputNumber min={0} className="w-full" placeholder="Stock" />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </div>
                                        ))}
                                        <Button type="dashed" onClick={() => add({ stock: 0 })} icon={<PlusOutlined />} block>
                                            Add Variant
                                        </Button>
                                    </div>
                                )}
                            </Form.List>
                        </Card>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Card title="Images" className="mb-6">
                            {keptImages.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Current Images</div>
                                    <div className="flex flex-wrap gap-2">
                                        {keptImages.map((src) => (
                                            <div key={src} className="relative">
                                                <Image
                                                    src={imageUrl(src)}
                                                    width={72}
                                                    height={72}
                                                    className="rounded-lg object-cover"
                                                />
                                                <Button
                                                    size="small"
                                                    danger
                                                    type="text"
                                                    className="absolute -top-2 -right-2 bg-white shadow"
                                                    onClick={() =>
                                                        setKeptImages((prev) => prev.filter((s) => s !== src))
                                                    }
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Form.Item
                                label="Add Images (max 6)"
                                tooltip="Crop to a square (1:1) — this is exactly how it will appear on the storefront."
                            >
                                <ImgCrop aspect={1} rotationSlider quality={1}>
                                    <Upload
                                        listType="picture-card"
                                        fileList={files}
                                        // No `beforeUpload={() => false}` here: returning `false` makes
                                        // AntD discard the cropped file and fall back to the original,
                                        // uncropped one. customRequest no-ops the network call instead,
                                        // so the cropped file still flows into fileList untouched.
                                        customRequest={({ onSuccess }) => onSuccess?.('ok')}
                                        onChange={({ fileList }) => setFiles(fileList.slice(0, 6))}
                                        accept="image/*"
                                        multiple
                                    >
                                        {files.length >= 6 ? null : (
                                            <div>
                                                <PlusOutlined />
                                                <div className="mt-1 text-xs">Upload</div>
                                            </div>
                                        )}
                                    </Upload>
                                </ImgCrop>
                            </Form.Item>
                        </Card>

                        <Card
                            title="Nutrition Facts"
                            extra={
                                <span className="text-xs text-gray-400">Shown as a table on the product page</span>
                            }
                            className="mt-6!"
                        >
                            <Form.List name="nutritionFacts">
                                {(fields, { add, remove }) => (
                                    <div className="flex flex-col gap-2">
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="flex gap-2 items-start">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'key']}
                                                    rules={[{ required: true, message: 'Key required' }]}
                                                    className="flex-1 mb-2"
                                                >
                                                    <Input placeholder="Calories" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    rules={[{ required: true, message: 'Value required' }]}
                                                    className="flex-1 mb-2"
                                                >
                                                    <Input placeholder="120 kcal" />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </div>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                                            Add Row
                                        </Button>
                                    </div>
                                )}
                            </Form.List>
                        </Card>
                    </Col>
                </Row>

                <div className="flex justify-end gap-3">
                    <Button onClick={() => navigate(ROUTES.PRODUCTS)}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={saving}>
                        {isEdit ? 'Save Changes' : 'Create Product'}
                    </Button>
                </div>
            </Form>
            )}
        </div>
    );
}
