/**
 * MongoDB connection config
 * Priority: Cloud (Atlas) → Local (backup)
 */
export const mongoConfig = {
  /**
   * Trả về URI theo thứ tự ưu tiên:
   * 1. MONGODB_URI (cloud Atlas)
   * 2. MONGODB_LOCAL_URI (local backup)
   */
  getUri(): string {
    const cloud = process.env.MONGODB_URI;
    const local = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/celebi_db';

    if (cloud) {
      console.log('[MongoDB] Using cloud (Atlas)');
      return cloud;
    }

    console.warn('[MongoDB] Cloud URI not set — falling back to local');
    return local;
  },

  options: {
    // Thử kết nối cloud 5s, nếu fail tự chuyển sang local
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  },
};
