import { useEffect, useState } from 'react';
import { Button, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import RowActions from '../../components/molecules/RowActions';
import StatusTag from '../../components/atoms/StatusTag';
import DataTable from '../../components/organisms/DataTable';
import CategoryFormDrawer from '../../components/organisms/categories/CategoryFormDrawer';
import useTableQuery from '../../hooks/useTableQuery';
import {
    fetchCategories,
    createCategory as createCategoryApi,
    updateCategory as updateCategoryApi,
    deleteCategory as deleteCategoryApi,
} from '../../api/adminCategories.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

export default function CategoryManagementPage() {
    const [apiCategories, setApiCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadCategories = () => {
        setLoading(true);
        fetchCategories()
            .then(setApiCategories)
            .catch((err) => message.error(apiError(err, 'Failed to load categories')))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const clientQuery = useTableQuery(apiCategories, { searchKeys: ['name', 'slug'] });

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const openCreate = () => {
        setEditingCategory(null);
        setDrawerOpen(true);
    };

    const openEdit = (category) => {
        setEditingCategory(category);
        setDrawerOpen(true);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            if (editingCategory) {
                await updateCategoryApi(editingCategory.id, values);
                message.success('Category updated');
            } else {
                await createCategoryApi(values);
                message.success('Category created');
            }
            loadCategories();
            setDrawerOpen(false);
        } catch (err) {
            message.error(apiError(err, 'Failed to save category'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        try {
            await deleteCategoryApi(category.id);
            loadCategories();
            message.success('Category deleted');
        } catch (err) {
            message.error(apiError(err, 'Failed to delete category'));
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Slug', dataIndex: 'slug', render: (slug) => <span className="font-mono text-xs">{slug}</span> },
        {
            title: 'Products',
            dataIndex: 'productCount',
            sorter: (a, b) => (a.productCount ?? 0) - (b.productCount ?? 0),
            render: (count) => <Tag>{count ?? 0}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <RowActions onEdit={() => openEdit(record)} onDelete={() => handleDelete(record)} />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Category Management"
                subtitle="Manage the categories products are organized and filtered by"
                actions={
                    <>
                        <SearchBar
                            value={clientQuery.searchText}
                            onChange={clientQuery.setSearchText}
                            placeholder="Search categories..."
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            Add Category
                        </Button>
                    </>
                }
            />

            <DataTable columns={columns} data={clientQuery.filteredData} loading={loading} />

            <CategoryFormDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleSubmit}
                initialValues={editingCategory}
                saving={saving}
            />
        </div>
    );
}
