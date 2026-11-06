import { useEffect } from 'react';
import { Drawer, Form, Input, Select, Button } from 'antd';

// Preview-only — the backend derives and owns the real slug. Just gives the
// admin a sense of what URL/value a name will produce.
const previewSlug = (name) =>
    String(name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export default function CategoryFormDrawer({ open, onClose, onSubmit, initialValues, saving = false }) {
    const [form] = Form.useForm();
    const nameValue = Form.useWatch('name', form);

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const handleFinish = (values) => {
        onSubmit(values);
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={initialValues ? 'Edit Category' : 'New Category'}
            width={420}
            rootClassName="mobile-full-drawer"
            destroyOnHidden
            extra={
                <Button type="primary" loading={saving} onClick={() => form.submit()}>
                    Save
                </Button>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ status: 'active' }}>
                <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
                    <Input placeholder="Protein Powders" />
                </Form.Item>

                {!initialValues && nameValue?.trim() && (
                    <div className="-mt-3 mb-4 text-xs text-gray-400">
                        Slug: <span className="font-mono">{previewSlug(nameValue)}</span>
                    </div>
                )}
                {initialValues && (
                    <div className="-mt-3 mb-4 text-xs text-gray-400">
                        Slug: <span className="font-mono">{initialValues.slug}</span> (fixed — used by existing
                        products and links)
                    </div>
                )}

                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select
                        options={[
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
}
