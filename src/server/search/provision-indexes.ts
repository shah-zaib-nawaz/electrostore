import { MongoClient } from 'mongodb';
import { env } from '@/lib/env';

export const PRODUCTS_VECTOR_INDEX_DEF = {
  name: 'products_vector_index',
  type: 'vectorSearch',
  definition: {
    fields: [
      {
        type: 'vector',
        path: 'embedding',
        numDimensions: 3072,
        similarity: 'cosine',
        quantization: 'scalar',
      },
      { type: 'filter', path: 'isActive' },
      { type: 'filter', path: 'category' },
      { type: 'filter', path: 'brand' },
      { type: 'filter', path: 'price' },
      { type: 'filter', path: 'stock' },
    ],
  },
};

export const PRODUCTS_TEXT_INDEX_DEF = {
  name: 'products_text_index',
  type: 'search',
  definition: {
    mappings: {
      dynamic: true,
      fields: {
        name: [
          { type: 'string' },
          { type: 'autocomplete' },
        ],
        sku: { type: 'token' },
        description: { type: 'string' },
        tags: { type: 'string' },
      },
    },
  },
};

export async function provisionAtlasSearchIndexes() {
  const client = new MongoClient(env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('products');

    console.log('Connecting to MongoDB Atlas to inspect/create search indexes...');
    
    // Check existing search indexes if supported on cluster
    try {
      const cursor = collection.listSearchIndexes();
      const existingIndexes = await cursor.toArray();
      console.log('Existing Atlas Search indexes:', JSON.stringify(existingIndexes, null, 2));

      const hasVector = existingIndexes.some((idx: any) => idx.name === 'products_vector_index');
      const hasText = existingIndexes.some((idx: any) => idx.name === 'products_text_index');

      if (!hasVector) {
        console.log('Creating products_vector_index...');
        await collection.createSearchIndex(PRODUCTS_VECTOR_INDEX_DEF);
      } else {
        console.log('products_vector_index already exists.');
      }

      if (!hasText) {
        console.log('Creating products_text_index...');
        await collection.createSearchIndex(PRODUCTS_TEXT_INDEX_DEF);
      } else {
        console.log('products_text_index already exists.');
      }
    } catch (indexError) {
      console.warn('Atlas Search index management via driver returned:', (indexError as Error).message);
    }
  } finally {
    await client.close();
  }
}
