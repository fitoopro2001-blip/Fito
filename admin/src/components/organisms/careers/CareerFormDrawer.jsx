import { Drawer, Form, Input, Switch, Button } from 'antd';
import { useEffect } from 'react';

export default function CareerFormDrawer({ open, onClose, onSubmit, initialValues, saving = false }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.setFieldsValue({ isOpen: true });
            }
        }
    }, [open, initialValues, form]);

    const handleFinish = (values) => {
        onSubmit({ ...initialValues, ...values });
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={initialValues ? 'Edit Job Posting' : 'New Job Posting'}
            width={460}
            rootClassName="mobile-full-drawer"
            destroyOnHidden
            extra={
                <Button type="primary" loading={saving} onClick={() => form.submit()}>
                    Save
                </Button>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Title is required' }]}>
                    <Input placeholder="Registered Dietitian" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Description is required' }]}
                >
                    <Input.TextArea rows={5} placeholder="Role responsibilities, requirements, location, etc." />
                </Form.Item>

                <Form.Item
                    name="link"
                    label="Application Link"
                    rules={[{ required: true, message: 'Application link is required' }]}
                >
                    <Input placeholder="https://forms.gle/..." />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Contact Email"
                    rules={[
                        { required: true, message: 'Contact email is required' },
                        { type: 'email', message: 'Enter a valid email' },
                    ]}
                >
                    <Input placeholder="careers@fitoo.com" />
                </Form.Item>

                <Form.Item name="isOpen" label="Position Open" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Drawer>
    );
}
