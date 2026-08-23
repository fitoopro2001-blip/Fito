import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ROLES } from '../constants/roles';
import { loginAdmin } from '../api/adminAuth.api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'Fito_admin_auth';

const loadStoredUser = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadStoredUser);

    const login = useCallback(async (email, password) => {
        const admin = await loginAdmin(email, password);
        if (!admin) {
            throw new Error('Invalid email or password');
        }
        const nextUser = { name: admin.name, email: admin.email, role: admin.role, token: admin.token };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        return nextUser;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: !!user,
            isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
            login,
            logout,
        }),
        [user, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
