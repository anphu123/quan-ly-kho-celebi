import api from '../lib/api';

// Auto-detect backend URL for LAN access
const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const hostname = window.location.hostname;

    // Automatically replace localhost with actual LAN IP if accessed via network
    if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return envUrl.replace(/localhost|127\.0\.0\.1/, hostname).replace('/api/v1', '');
        }
    }

    // Use env variable if explicitly set
    if (envUrl) {
        return envUrl.replace('/api/v1', '');
    }

    // Fallback
    const port = 6868;
    return `http://${hostname}:${port}`;
};

const BASE_URL = getBackendUrl();
console.log('📤 Upload API Base URL:', BASE_URL);

export const uploadApi = {
    /**
     * Upload multiple image files (File objects, not base64).
     * Returns array of absolute URLs pointing to the server.
     */
    async uploadImages(files: File[]): Promise<string[]> {
        if (files.length === 0) return [];
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        const response = await api.post('/uploads/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return (response.data.urls as string[]).map(url => `${BASE_URL}${url}`);
    },

    /**
     * Upload a single image file. Returns the absolute URL.
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url: string = response.data.url;
        return `${BASE_URL}${url}`;
    },
};
