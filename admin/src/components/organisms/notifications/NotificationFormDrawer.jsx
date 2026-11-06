import { Drawer, Form, Input, Select, DatePicker, Button } from 'antd';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import { NOTIFICATION_TYPES, NOTIFICATION_AUDIENCES, NOTIFICATION_STATUSES } from '../../../data/notifications';

export default function NotificationFormDrawer({ open, onClose, onSubmit, initialValues, saving = false }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                form.setFieldsValue({ ...initialValues, date: dayjs(initialValues.date) });
            }
        }
    }, [open, initialValues, form]);

    const handleFinish = (values) => {
        onSubmit({ ...initialValues, ...values, date: values.date.format('YYYY-MM-DD') });
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={initialValues ? 'Edit Notification' : 'New Notification'}
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
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input placeholder="New Year, New Goals" />
                </Form.Item>

                <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                    <Input.TextArea rows={4} placeholder="What should users see?" />
                </Form.Item>

                <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                    <Select options={NOTIFICATION_TYPES} />
                </Form.Item>

                <Form.Item name="audience" label="Audience" rules={[{ required: true }]}>
                    <Select options={NOTIFICATION_AUDIENCES} />
                </Form.Item>

                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select options={NOTIFICATION_STATUSES.map((s) => ({ label: s, value: s }))} />
                </Form.Item>

                <Form.Item name="date" label="Send Date" rules={[{ required: true }]}>
                    <DatePicker className="w-full" />
                </Form.Item>
            </Form>
        </Drawer>
    );
}
