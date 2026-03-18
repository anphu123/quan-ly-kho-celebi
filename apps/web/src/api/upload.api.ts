import api from '../lib/api';

export const uploadApi = {
    /**
     * Upload multiple image files. Returns relative paths (e.g. /api/v1/uploads/files/:id).
     * Use resolveImageUrl() at display time to get the full URL.
     */
    async uploadImages(files: File[]): Promise<string[]> {
        if (files.length === 0) return [];
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        const response = await api.post('/uploads/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.urls as string[];
    },

    /**
     * Upload a single image file. Returns a relative path.
     * Use resolveImageUrl() at display time to get the full URL.
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.url as string;
    },
};
