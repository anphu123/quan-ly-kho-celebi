import api from '../lib/api';
import { resolveImageUrl } from '../lib/image';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const validateImageFile = (file: File) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF.');
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    throw new Error(`Ảnh quá lớn (${sizeMb.toFixed(1)}MB). Giới hạn ${MAX_FILE_SIZE_MB}MB.`);
  }
};

export const uploadApi = {
  /**
   * Upload multiple image files (File objects, not base64).
   * Returns array of absolute URLs pointing to the server.
   */
  async uploadImages(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];
    files.forEach(validateImageFile);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const response = await api.post('/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (response.data.urls as string[]).map(resolveImageUrl);
  },

  /**
   * Upload a single image file. Returns the absolute URL.
   */
  async uploadImage(file: File): Promise<string> {
    validateImageFile(file);
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url: string = response.data.url;
    return resolveImageUrl(url);
  },
};
