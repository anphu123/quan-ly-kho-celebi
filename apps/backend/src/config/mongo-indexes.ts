import { Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';

const logger = new Logger('MongoIndexes');
let indexesEnsured = false;

export async function ensureMongoIndexes(uri: string): Promise<void> {
  if (indexesEnsured || !uri) return;

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const dbName = client.options.dbName;
    if (!dbName) {
      logger.warn('Skipping Mongo index check because the URI has no database name.');
      indexesEnsured = true;
      return;
    }

    const collection = client.db(dbName).collection('inbound_items');
    const indexes = await collection.indexes();
    const legacySerialItemIndex = indexes.find(
      (index) =>
        index.unique === true &&
        index.key &&
        typeof index.key === 'object' &&
        Object.keys(index.key).length === 1 &&
        'serialItemId' in index.key,
    );

    if (legacySerialItemIndex?.name) {
      await collection.dropIndex(legacySerialItemIndex.name);
      logger.warn(`Dropped legacy unique index: ${legacySerialItemIndex.name}`);
    }

    indexesEnsured = true;
  } finally {
    await client.close();
  }
}
