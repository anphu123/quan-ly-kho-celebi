import axios from 'axios';
import { getAccessToken, getRefreshToken, persistTokens } from './auth-storage';
import { useAuthStore } from '../stores/auth.store';

// Auto-detect API URL based on current host for LAN access
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;

  // Automatically replace localhost with actual LAN IP if accessed via network
  if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return envUrl.replace(/localhost|127\.0\.0\.1/, hostname);
    }
  }

  // Use env variable if explicitly set
  if (envUrl) return envUrl;

  // Fallback: same origin (backend served on same domain via Vercel functions)
  // For local dev with port, check if running on localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:6868/api/v1`;
  }

  // Production: API is served on the same domain
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}/api/v1`;
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const nextRefreshToken = data.refreshToken ?? refreshToken;
        if (nextRefreshToken) {
          persistTokens(data.accessToken, nextRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
