import axios from 'axios';

const AUTH_STORAGE_KEY = 'Fito_admin_auth';

// Dispatched when the server rejects a request with 401 while a session token
// is present, i.e. the session has expired / been revoked. AuthContext listens
// for this to clear state and bounce the user to the login screen.
export const AUTH_EXPIRED_EVENT = 'fito-admin:auth-expired';

// Requests to these endpoints returning 401 mean "bad credentials / bad OTP",
// not "session expired", so they must not trigger a forced logout + redirect.
const AUTH_ENDPOINTS = [
    '/admin/auth/login',
    '/admin/auth/signup',
    '/admin/auth/verify-otp',
    '/admin/auth/resend-otp',
    '/admin/auth/forgot-password',
    '/admin/auth/reset-password',
];

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

apiClient.interceptors.request.use((config) => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const token = raw ? JSON.parse(raw)?.token : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const isAuthRequest = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
        const hasSession = !!localStorage.getItem(AUTH_STORAGE_KEY);

        if (status === 401 && !isAuthRequest && hasSession) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
        }

        return Promise.reject(error);
    }
);

export default apiClient;
