import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Space, Table, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import { fetchProducts } from '../../api/adminProducts.api';
import { createPosOrder } from '../../api/adminOrders.api';
import { ROUTES } from '../../constants/routes';

const roundMoney = (value) => Math.round(value * 100) / 100;
const errorMessage = (error) => error.response?.data?.message || 'Could not create the POS order';

export default function PosOrderPage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState();
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const deliveryCharge = Form.useWatch('deliveryCharge', form) ?? 0;

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            setProductsLoading(true);
            try {
                const result = await fetchProducts({
                    page: 1,
                    limit: 100,
                    search: productSearch,
                    status: 'published',
                });
                if (!cancelled) setProducts(result.items);
            } catch {
                if (!cancelled) message.error('Could not load products for POS');
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [productSearch]);

    const productOptions = useMemo(
        () =>
            products.flatMap((product) => {
                if (product.variants?.length) {
                    return product.variants
                        .filter((variant) => variant.stock > 0)
                        .map((variant) => ({
                            value: `${product.id}::${variant.name}`,
                            label: `${product.name} — ${variant.name} (Stock: ${variant.stock})`,
                            item: {
                                productId: product.id,
                                productName: product.name,
                                variantName: variant.name,
                                availableStock: variant.stock,
                                price: variant.price ?? product.price,
                            },
                        }));
                }
                return product.stock > 0
                    ? [
                          {
                              value: product.id,
                              label: `${product.name} (Stock: ${product.stock})`,
                              item: {
                                  productId: product.id,
                                  productName: product.name,
                                  availableStock: product.stock,
                                  price: product.price,
                              },
                          },
                      ]
                    : [];
            }),
        [products]
    );

    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.qty, 0));
    const total = roundMoney(subtotal + Number(deliveryCharge || 0));

    const addItem = (value, option) => {
        if (!option?.item) return;
        setItems((current) => {
            const existing = current.find((item) => item.key === value);
            if (existing) {
                if (existing.qty >= existing.availableStock) {
                    message.warning('Quantity cannot exceed available stock');
                    return current;
                }
                return current.map((item) =>
                    item.key === value ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...current, { key: value, ...option.item, qty: 1 }];
        });
        setSelectedProduct(undefined);
    };

    const updateItem = (key, changes) => {
        setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));
    };

    const onFinish = async (values) => {
        if (!items.length) {
            message.error('Add at least one product to the order');
            return;
        }
        setSaving(true);
        try {
            const order = await createPosOrder({
                items: items.map(({ productId, variantName, qty, price }) => ({
                    productId,
                    ...(variantName ? { variantName } : {}),
                    qty,
                    price,
                })),
                deliveryCharge: Number(values.deliveryCharge || 0),
                paymentMethod: values.paymentMethod,
                shipping: {
                    name: values.name,
                    phone: values.phone,
                    email: values.email,
                    address: values.address,
                    city: values.city,
                },
            });
            message.success(`POS order ${order.orderNumber} created`);
            navigate(ROUTES.ORDERS);
        } catch (error) {
            message.error(errorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { title: 'Product', dataIndex: 'productName' },
        { title: 'Option', dataIndex: 'variantName', render: (value) => value || '—' },
        { title: 'Stock', dataIndex: 'availableStock' },
        {
            title: 'Qty',
            dataIndex: 'qty',
            render: (qty, item) => (
                <InputNumber
                    min={1}
                    max={item.availableStock}
                    precision={0}
                    value={qty}
                    onChange={(value) => value && updateItem(item.key, { qty: value })}
                />
            ),
        },
        {
            title: 'Selling price (Rs.)',
            dataIndex: 'price',
            render: (price, item) => (
                <InputNumber
                    min={0}
                    precision={2}
                    value={price}
                    onChange={(value) => value !== null && updateItem(item.key, { price: value })}
                />
            ),
        },
        {
            title: 'Line total',
            render: (_, item) => `Rs. ${roundMoney(item.price * item.qty).toFixed(2)}`,
        },
        {
            title: '',
            key: 'remove',
            render: (_, item) => (
                <Button
                    aria-label={`Remove ${item.productName}`}
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setItems((current) => current.filter((entry) => entry.key !== item.key))}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Point of Sale"
                subtitle="Create a manual sale, set each selling price and deduct stock"
                actions={<Button onClick={() => navigate(ROUTES.ORDERS)}>Back to orders</Button>}
            />

            <Card title="Products" className="mb-4">
                <Select
                    className="w-full"
                    showSearch
                    allowClear
                    filterOption={false}
                    placeholder="Search and add a product"
                    value={selectedProduct}
                    searchValue={productSearch}
                    onSearch={setProductSearch}
                    onChange={addItem}
                    options={productOptions}
                    loading={productsLoading}
                    notFoundContent={productsLoading ? 'Loading products...' : 'No in-stock products found'}
                />
                <Table
                    className="mt-4"
                    rowKey="key"
                    columns={columns}
                    dataSource={items}
                    pagination={false}
                    scroll={{ x: 760 }}
                    locale={{ emptyText: 'Add products to start this sale' }}
                />
            </Card>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ paymentMethod: 'cash', deliveryCharge: 0 }}
                onFinish={onFinish}
            >
                <Card title="Customer and payment" className="mb-4">
                    <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                        <Form.Item name="name" label="Customer name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="email" label="Email">
                            <Input type="email" />
                        </Form.Item>
                        <Form.Item name="city" label="City" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="address" label="Delivery address" rules={[{ required: true }]} className="md:col-span-2">
                            <Input />
                        </Form.Item>
                        <Form.Item name="paymentMethod" label="Payment method" rules={[{ required: true }]}>
                            <Select
                                options={[
                                    { value: 'cash', label: 'Cash' },
                                    { value: 'online', label: 'Online Transfer' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="deliveryCharge"
                            label="Delivery charges (Rs.)"
                            rules={[{ required: true, type: 'number', min: 0 }]}
                        >
                            <InputNumber className="w-full" min={0} precision={2} />
                        </Form.Item>
                    </div>
                </Card>

                <Card title="Order total">
                    <Space direction="vertical" className="w-full">
                        <div className="flex justify-between"><span>Subtotal</span><strong>Rs. {subtotal.toFixed(2)}</strong></div>
                        <div className="flex justify-between"><span>Delivery charges</span><strong>Rs. {Number(deliveryCharge || 0).toFixed(2)}</strong></div>
                        <div className="flex justify-between text-lg"><span>Total</span><strong>Rs. {total.toFixed(2)}</strong></div>
                        {!items.length && <Alert type="info" showIcon message="Add products before saving the order." />}
                        <Button type="primary" htmlType="submit" loading={saving} disabled={!items.length} icon={<PlusOutlined />}>
                            Save POS order
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}
