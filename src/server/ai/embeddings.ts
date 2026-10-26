import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Product } from '@/server/models/Product';
import { connectToDatabase } from '@/lib/db';
import type { IProduct } from '@/types/domain';

export function constructProductEmbeddingText(product: {
  name: string;
  brand?: any;
  category?: any;
  shortDescription?: string;
  description?: string;
  tags?: string[];
  specifications?: Record<string, string> | Map<string, string>;
}): string {
  const parts: string[] = [
    `Product: ${product.name}`,
  ];

  if (product.shortDescription) {
    parts.push(`Overview: ${product.shortDescription}`);
  }

  if (product.tags && product.tags.length > 0) {
    parts.push(`Tags: ${product.tags.join(', ')}`);
  }

  if (product.specifications) {
    const specsObj = product.specifications instanceof Map
      ? Object.fromEntries(product.specifications)
      : product.specifications;

    const specsStr = Object.entries(specsObj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    if (specsStr) {
      parts.push(`Specifications: ${specsStr}`);
    }
  }

  if (product.description) {
    parts.push(`Details: ${product.description.slice(0, 1000)}`);
  }

  return parts.join(' | ');
}

export async function embedQuery(query: string): Promise<number[]> {
  try {
    const embeddingPromise = embed({
      model: openai.embedding('text-embedding-3-large') as any,
      value: query,
    });

    // 1800ms timeout race to keep search sub-250ms
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('EMBEDDING_TIMEOUT')), 1800)
    );

    const { embedding } = await Promise.race([embeddingPromise, timeoutPromise]);
    return embedding;
  } catch (error) {
    console.warn('[Embeddings] Fallback triggered due to error or timeout:', error);
    throw error;
  }
}

export async function generateProductEmbedding(productId: string): Promise<number[] | null> {
  await connectToDatabase();
  const product = await Product.findById(productId).populate('category brand');
  if (!product) return null;

  const textToEmbed = constructProductEmbeddingText(product as any);

  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-large') as any,
      value: textToEmbed,
    });

    product.embedding = embedding;
    await product.save();

    console.log(`[Embeddings] Generated 3072-dim vector for product ${productId}`);
    return embedding;
  } catch (err) {
    console.error(`[Embeddings] Failed generating embedding for product ${productId}:`, err);
    return null;
  }
}

export async function batchEmbedProducts(products: Array<IProduct & { _id: any }>) {
  const texts = products.map(constructProductEmbeddingText);
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-large') as any,
    values: texts,
  });

  return embeddings;
}
