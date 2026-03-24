import { getMongoConnectionUri } from './runtime-env';

/**
 * MongoDB connection config
 * Priority: Cloud (Atlas) → Local (backup)
 */
export const mongoConfig = {
  /**
  * Trả về URI theo thứ tự ưu tiên:
   * 1. MONGODB_URI / DATABASE_URL
   * 2. MONGODB_LOCAL_URI (local backup)
   */
  getUri(): string {
    const uri = getMongoConnectionUri();
    const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');

    if (isLocal) {
      console.warn('[MongoDB] Cloud URI not set — falling back to local');
    } else {
      console.log('[MongoDB] Using configured MongoDB URI');
    }

    return uri;
  },

  options: {
    // Thử kết nối cloud 5s, nếu fail tự chuyển sang local
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  },
};
