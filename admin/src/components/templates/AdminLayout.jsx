import { useState } from 'react';
import { Layout, Drawer } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';
import useMediaQuery from '../../hooks/useMediaQuery';

const { Sider, Content } = Layout;

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width: 1023px)');
    const location = useLocation();

    // A route change means the user picked a destination from the sidebar —
    // close the off-canvas drawer so it doesn't linger over the new page.
    // Adjusted during render (rather than in an effect) to avoid an extra
    // commit where the drawer briefly stays open over the new page.
    const [trackedPathname, setTrackedPathname] = useState(location.pathname);
    if (location.pathname !== trackedPathname) {
        setTrackedPathname(location.pathname);
        setMobileOpen(false);
    }

    const handleToggle = () => {
        if (isMobile) {
            setMobileOpen((o) => !o);
        } else {
            setCollapsed((c) => !c);
        }
    };

    return (
        <Layout className="min-h-screen">
            {isMobile ? (
                <Drawer
                    placement="left"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    closable={false}
                    width={230}
                    styles={{ body: { padding: 0 } }}
                >
                    <Sidebar collapsed={false} />
                </Drawer>
            ) : (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={230}
                    style={{ height: '100vh', position: 'sticky', top: 0, left: 0 }}
                >
                    <Sidebar collapsed={collapsed} />
                </Sider>
            )}
            <Layout>
                <Header collapsed={collapsed} isMobile={isMobile} onToggle={handleToggle} />
                <Content className="p-4 sm:p-6 bg-page min-h-[calc(100vh-64px)] overflow-x-hidden">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
