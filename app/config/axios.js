import axios from 'axios';

const AUTH_STORAGE_KEY = 'Fitoo_app_auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  // A hung backend call (e.g. a stalled outbound email send) used to spin
  // the UI forever with no error. Bail out and let the caller show a retry
  // message instead.
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  const token = raw ? JSON.parse(raw)?.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
