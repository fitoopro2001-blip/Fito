import { Tabs, Form, Input, Button, message, Card } from 'antd';
import { useAuth } from '../../context/AuthContext';
import PageHeading from '../../components/atoms/PageHeading';

function AdminProfileTab() {
    const { user } = useAuth();
    const [form] = Form.useForm();

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm max-w-lg">
            <Form
                form={form}
                layout="vertical"
                initialValues={{ name: user?.name, email: user?.email }}
                onFinish={() => message.success('Profile updated')}
            >
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit">Save Changes</Button>
            </Form>
        </Card>
    );
}

function GeneralSettingsTab() {
    const [form] = Form.useForm();

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm max-w-lg">
            <Form
                form={form}
                layout="vertical"
                initialValues={{ storeName: 'Fito', supportEmail: 'support@Fito.com' }}
                onFinish={() => message.success('Settings saved')}
            >
                <Form.Item name="storeName" label="Store Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="supportEmail" label="Support Email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit">Save Settings</Button>
            </Form>
        </Card>
    );
}

export default function SettingsPage() {
    return (
        <div>
            <PageHeading title="Settings" subtitle="Manage your admin profile and preferences" />
            <Tabs
                defaultActiveKey="profile"
                items={[
                    { key: 'profile', label: 'Admin Profile', children: <AdminProfileTab /> },
                    { key: 'general', label: 'General Settings', children: <GeneralSettingsTab /> },
                ]}
            />
        </div>
    );
}
