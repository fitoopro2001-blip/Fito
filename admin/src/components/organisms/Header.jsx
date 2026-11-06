import { Avatar, Dropdown } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';
import { PAGE_TITLES } from '../../constants/pageTitles';

const getPageTitle = (pathname) => {
    const match = PAGE_TITLES.find((entry) => matchPath({ path: entry.path, end: true }, pathname));
    return match?.title ?? '';
};

export default function Header({ collapsed, isMobile, onToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    const menuItems = [
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => navigate(ROUTES.SETTINGS) },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sign Out',
            danger: true,
            onClick: () => {
                logout();
                navigate(ROUTES.LOGIN);
            },
        },
    ];

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={isMobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="text-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors shrink-0 w-9 h-9 rounded-lg flex items-center justify-center -ml-1"
                >
                    {isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{pageTitle}</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <button type="button" className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 -mr-2 hover:bg-gray-50 transition-colors">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                            <p className="text-xs text-gray-500 leading-tight">{ROLE_LABELS[user?.role]}</p>
                        </div>
                        <Avatar icon={<UserOutlined />} className="bg-primary-light text-primary" />
                    </button>
                </Dropdown>
            </div>
        </header>
    );
}
