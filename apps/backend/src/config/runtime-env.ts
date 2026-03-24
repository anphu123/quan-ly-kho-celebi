const LOCAL_MONGO_FALLBACK = 'mongodb://localhost:27017/celebi_db';

function isProductionLike() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

export function normalizeDatabaseEnv() {
  const mongoUri = process.env.MONGODB_URI?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (mongoUri && !databaseUrl) {
    process.env.DATABASE_URL = mongoUri;
  }

  if (databaseUrl && !mongoUri) {
    process.env.MONGODB_URI = databaseUrl;
  }
}

export function getMongoConnectionUri() {
  normalizeDatabaseEnv();

  const resolvedUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (resolvedUri) {
    return resolvedUri;
  }

  if (isProductionLike()) {
    throw new Error(
      'Missing MongoDB connection string. Set DATABASE_URL or MONGODB_URI in the runtime environment.',
    );
  }

  return process.env.MONGODB_LOCAL_URI || LOCAL_MONGO_FALLBACK;
}
