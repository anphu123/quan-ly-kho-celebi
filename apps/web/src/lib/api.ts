import axios from 'axios';

// Auto-detect API URL based on current host for LAN access
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;

  // Automatically replace localhost with actual LAN IP if accessed via network
  if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const url = envUrl.replace(/localhost|127\.0\.0\.1/, hostname);
      console.log('🌐 API URL (LAN Override):', url);
      return url;
    }
  }

  // Use env variable if explicitly set
  if (envUrl) {
    console.log('🔧 Using API URL from env:', envUrl);
    return envUrl;
  }

  // Fallback
  const port = 6868;
  const url = `http://${hostname}:${port}/api/v1`;
  console.log('🌐 API URL (Fallback):', url);
  return url;
};

const API_URL = getApiUrl();
console.log('✅ Final API Base URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
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
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
