import { Tabs } from 'antd';
import AdminUsersTable from '../../components/organisms/users/AdminUsersTable';
import AppUsersTable from '../../components/organisms/users/AppUsersTable';

export default function UserManagementPage() {
    return (
        <Tabs
            defaultActiveKey="admins"
            items={[
                { key: 'admins', label: 'Admin Users', children: <AdminUsersTable /> },
                { key: 'app-users', label: 'App Users', children: <AppUsersTable /> },
            ]}
        />
    );
}
