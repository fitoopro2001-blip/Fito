import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Descriptions, Image, Button, Tag, Table, message } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { PlusOutlined, SwapOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import RowActions from '../../components/molecules/RowActions';
import StatusTag from '../../components/atoms/StatusTag';
import RatingStars from '../../components/atoms/RatingStars';
import DataTable from '../../components/organisms/DataTable';
import SortableProductsTable from '../../components/organisms/SortableProductsTable';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import useCategories from '../../hooks/useCategories';
import { ROUTES, productEditPath } from '../../constants/routes';
import imageUrl from '../../utils/imageUrl';
import { fetchProducts, deleteProduct as deleteProductApi, reorderProducts } from '../../api/adminProducts.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

// The real API already includes `discountedPrice`; derive it from
// price + discountPercent when missing.
const finalPrice = (product) =>
    product.discountedPrice ??
    (product.discountPercent > 0
        ? Math.round(product.price * (1 - product.discountPercent / 100) * 100) / 100
        : product.price);

export default function ProductManagementPage() {
    const navigate = useNavigate();
    const serverQuery = useServerTableQuery(fetchProducts);
    const { categories } = useCategories();
    const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name ?? slug;

    const products = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;

    // Set when arriving from the dashboard's "Best Selling"/"Out of Stock"
    // lists — highlights and scrolls to the product that was clicked.
    const location = useLocation();
    const highlightProductId = location.state?.highlightProductId;

    useEffect(() => {
        if (!highlightProductId || loading) return;
        const row = document.querySelector(`tr[data-row-key="${highlightProductId}"]`);
        row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [highlightProductId, loading]);

    const [viewing, setViewing] = useState(null);

    // Reorder mode swaps the paginated/searchable table for a flat, draggable
    // one — search/filters/sort don't make sense against a manual order, and
    // dragging across pages would be confusing, so it works against the full
    // list instead.
    const [reorderMode, setReorderMode] = useState(false);
    const [reorderItems, setReorderItems] = useState([]);
    const [reorderLoading, setReorderLoading] = useState(false);

    const enterReorderMode = async () => {
        setReorderLoading(true);
        setReorderMode(true);
        try {
            const { items } = await fetchProducts({ page: 1, limit: 100 });
            setReorderItems(items);
        } catch (err) {
            message.error(apiError(err, 'Failed to load products for reordering'));
            setReorderMode(false);
        } finally {
            setReorderLoading(false);
        }
    };

    const exitReorderMode = () => {
        setReorderMode(false);
        serverQuery.refetch();
    };

    const handleReorder = async (nextItems) => {
        setReorderItems(nextItems);
        try {
            await reorderProducts(nextItems.map((item) => item.id));
        } catch (err) {
            message.error(apiError(err, 'Failed to save the new order'));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProductApi(id);
            serverQuery.refetch();
            message.success('Product deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete product'));
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
        { title: 'Name', dataIndex: 'name' },
        {
            title: 'Category',
            dataIndex: 'category',
            filters: categories.map((c) => ({ text: c.name, value: c.slug })),
            filteredValue: [serverQuery.filters.category].filter(Boolean),
            render: (category) => categoryName(category),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (p, record) =>
                record.discountPercent > 0 ? (
                    <span className="text-gray-400 line-through">{`Rs. ${p.toFixed(2)}`}</span>
                ) : (
                    `Rs. ${p.toFixed(2)}`
                ),
        },
        {
            title: 'Discount',
            dataIndex: 'discountPercent',
            render: (discountPercent) =>
                discountPercent > 0 ? <Tag color="green">{discountPercent}% off</Tag> : <Tag>None</Tag>,
        },
        {
            title: 'Final Price',
            key: 'finalPrice',
            render: (_, record) => <span className="font-semibold">{`Rs. ${finalPrice(record).toFixed(2)}`}</span>,
        },
        { title: 'Stock', dataIndex: 'stock' },
        { title: 'Rating', dataIndex: 'rating', render: (r) => <RatingStars rating={r ?? 0} /> },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: [
                { text: 'Published', value: 'published' },
                { text: 'Draft', value: 'draft' },
                { text: 'Out of Stock', value: 'out_of_stock' },
                { text: 'Coming Soon', value: 'coming_soon' },
            ],
            filteredValue: [serverQuery.filters.status].filter(Boolean),
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions
                    onView={() => setViewing(record)}
                    onEdit={() => navigate(productEditPath(record.id))}
                    onDelete={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Product Management"
                subtitle={reorderMode ? 'Drag rows to change the display order' : "Manage your store's products"}
                actions={
                    reorderMode ? (
                        <Button onClick={exitReorderMode}>Done Reordering</Button>
                    ) : (
                        <>
                            <SearchBar value={searchText} onChange={setSearchText} placeholder="Search products..." />
                            <Button icon={<SwapOutlined />} onClick={enterReorderMode}>
                                Reorder
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.PRODUCT_ADD)}>
                                Add Product
                            </Button>
                        </>
                    )
                }
            />

            {reorderMode ? (
                <SortableProductsTable
                    items={reorderItems}
                    onReorder={handleReorder}
                    loading={reorderLoading}
                    categoryName={categoryName}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={products}
                    loading={loading}
                    rowClassName={(record) => (record.id === highlightProductId ? 'row-highlight' : '')}
                    pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                    onChange={serverQuery.handleTableChange}
                />
            )}

            <Modal
                open={!!viewing}
                title="Product Details"
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
                            <Descriptions.Item label="Name">{viewing.name}</Descriptions.Item>
                            <Descriptions.Item label="Category">{categoryName(viewing.category)}</Descriptions.Item>
                            <Descriptions.Item label="Price">
                                {viewing.discountPercent > 0 ? (
                                    <>
                                        <span className="text-gray-400 line-through mr-2">{`Rs. ${viewing.price.toFixed(2)}`}</span>
                                        <span className="font-semibold">{`Rs. ${finalPrice(viewing).toFixed(2)}`}</span>
                                        <Tag color="green" className="ml-2">{viewing.discountPercent}% off</Tag>
                                    </>
                                ) : (
                                    `Rs. ${viewing.price.toFixed(2)}`
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Stock">{viewing.stock}</Descriptions.Item>
                            <Descriptions.Item label="Rating">
                                <RatingStars rating={viewing.rating ?? 0} /> ({viewing.reviews ?? 0} reviews)
                            </Descriptions.Item>
                            <Descriptions.Item label="Status"><StatusTag status={viewing.status} /></Descriptions.Item>
                            <Descriptions.Item label="Description">
                                <div
                                    className="[&_p]:m-0 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_s]:line-through"
                                    dangerouslySetInnerHTML={{ __html: viewing.description }}
                                />
                            </Descriptions.Item>
                        </Descriptions>
                        {viewing.nutritionFacts?.length > 0 && (
                            <div className="mt-4">
                                <div className="text-sm text-gray-500 mb-2">Nutrition Facts</div>
                                <Table
                                    size="small"
                                    pagination={false}
                                    showHeader={false}
                                    rowKey="key"
                                    dataSource={viewing.nutritionFacts}
                                    columns={[
                                        { dataIndex: 'key', className: 'font-medium' },
                                        { dataIndex: 'value' },
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
