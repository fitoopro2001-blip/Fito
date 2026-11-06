import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

export function RequireAuth() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
    return <Outlet />;
}

export function RequireSuperAdmin() {
    const { isSuperAdmin } = useAuth();
    if (!isSuperAdmin) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    return <Outlet />;
}
