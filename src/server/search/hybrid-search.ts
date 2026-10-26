import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { SearchLog } from '@/server/models/SearchLog';
import { embedQuery } from '@/server/ai/embeddings';
import { after } from 'next/server';
import mongoose from 'mongoose';

export interface HybridSearchParams {
  query: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
}

export function buildHybridRankFusionPipeline(options: {
  query: string;
  queryVector: number[];
  vectorFilter?: Record<string, any>;
  textFilters?: any[];
  limit?: number;
}) {
  const {
    query,
    queryVector,
    vectorFilter = { isActive: true },
    textFilters = [{ equals: { path: 'isActive', value: true } }],
    limit = 20,
  } = options;

  return [
    {
      $rankFusion: {
        input: {
          pipelines: {
            vectorPipeline: [
              {
                $vectorSearch: {
                  index: 'products_vector_index',
                  path: 'embedding',
                  queryVector,
                  numCandidates: 150,
                  limit: 40,
                  filter: vectorFilter,
                },
              },
            ],
            textPipeline: [
              {
                $search: {
                  index: 'products_text_index',
                  compound: {
                    must: [
                      {
                        text: {
                          query,
                          path: ['name', 'sku', 'description', 'tags'],
                          fuzzy: { maxEdits: 1 },
                        },
                      },
                    ],
                    filter: textFilters,
                  },
                },
              },
              { $limit: 40 },
            ],
          },
        },
        combination: {
          weights: { vectorPipeline: 0.7, textPipeline: 0.3 },
        },
        scoreDetails: true,
      },
    },
    { $limit: limit },
    {
      $project: {
        embedding: 0,
      },
    },
  ];
}

export async function hybridProductSearch(params: HybridSearchParams) {
  const startTime = Date.now();
  await connectToDatabase();

  const { query, category, brand, minPrice, maxPrice, inStockOnly, limit = 20 } = params;

  // Build filters for vector search pre-filtering
  const vectorFilter: Record<string, any> = { isActive: true };
  if (category) vectorFilter.category = new mongoose.Types.ObjectId(category);
  if (brand) vectorFilter.brand = new mongoose.Types.ObjectId(brand);
  if (inStockOnly) vectorFilter.stock = { $gt: 0 };
  if (minPrice !== undefined || maxPrice !== undefined) {
    vectorFilter.price = {};
    if (minPrice !== undefined) vectorFilter.price.$gte = minPrice;
    if (maxPrice !== undefined) vectorFilter.price.$lte = maxPrice;
  }

  // Build filters for Atlas text search
  const textFilters: any[] = [{ equals: { path: 'isActive', value: true } }];
  if (category) textFilters.push({ equals: { path: 'category', value: new mongoose.Types.ObjectId(category) } });
  if (brand) textFilters.push({ equals: { path: 'brand', value: new mongoose.Types.ObjectId(brand) } });

  let results: any[] = [];
  let usedVector = false;

  try {
    // Attempt generating 3072-dim query embedding with 1800ms race
    const queryVector = await embedQuery(query);
    usedVector = true;

    // MongoDB 8.0+/9.0 Native $rankFusion Pipeline
    const rankFusionPipeline: any[] = [
      {
        $rankFusion: {
          input: {
            pipelines: {
              vectorPipeline: [
                {
                  $vectorSearch: {
                    index: 'products_vector_index',
                    path: 'embedding',
                    queryVector,
                    numCandidates: 150,
                    limit: 40,
                    filter: vectorFilter,
                  },
                },
              ],
              textPipeline: [
                {
                  $search: {
                    index: 'products_text_index',
                    compound: {
                      must: [
                        {
                          text: {
                            query,
                            path: ['name', 'sku', 'description', 'tags'],
                            fuzzy: { maxEdits: 1 },
                          },
                        },
                      ],
                      filter: textFilters,
                    },
                  },
                },
                { $limit: 40 },
              ],
            },
          },
          combination: {
            weights: { vectorPipeline: 0.7, textPipeline: 0.3 },
          },
          scoreDetails: true,
        },
      },
      { $limit: limit },
      {
        $project: {
          embedding: 0,
        },
      },
    ];

    results = await Product.aggregate(rankFusionPipeline);
  } catch (error) {
    console.warn('[Search] Falling back to text-only pipeline due to embedding error:', (error as Error).message);
    
    // Resilient fallback: Text search only
    const fallbackPipeline: any[] = [
      {
        $search: {
          index: 'products_text_index',
          compound: {
            must: [
              {
                text: {
                  query,
                  path: ['name', 'sku', 'description', 'tags'],
                  fuzzy: { maxEdits: 1 },
                },
              },
            ],
            filter: textFilters,
          },
        },
      },
      { $limit: limit },
      {
        $project: {
          embedding: 0,
        },
      },
    ];

    try {
      results = await Product.aggregate(fallbackPipeline);
    } catch (fallbackError) {
      // Regex / B-tree fallback for local development or non-Atlas clusters
      const regexFilter: any = {
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      };
      if (category) regexFilter.category = category;
      if (brand) regexFilter.brand = brand;
      if (minPrice !== undefined || maxPrice !== undefined) {
        regexFilter.price = {};
        if (minPrice !== undefined) regexFilter.price.$gte = minPrice;
        if (maxPrice !== undefined) regexFilter.price.$lte = maxPrice;
      }
      results = await Product.find(regexFilter).limit(limit).select('-embedding').lean();
    }
  }

  const latencyMs = Date.now() - startTime;

  // Asynchronous telemetry logging via Next.js after()
  try {
    after(async () => {
      try {
        await SearchLog.create({
          query,
          latencyMs,
          resultsCount: results.length,
          topResultIds: results.slice(0, 5).map(r => r._id),
          filters: params,
          hasSemanticIntent: usedVector,
        });
      } catch (logErr) {
        console.error('Failed to log search telemetry:', logErr);
      }
    });
  } catch {
    // In environments where after() is outside a request context
  }

  return {
    results,
    latencyMs,
    count: results.length,
    usedRankFusion: usedVector,
  };
}

/**
 * Zero-Latency Similar Products:
 * Reuses the product's stored 3072-dim embedding directly with 0 external OpenAI API calls!
 */
export async function getSimilarProducts(productId: string, limit = 4) {
  await connectToDatabase();

  const product = await Product.findById(productId).select('+embedding');
  if (!product || !product.embedding || product.embedding.length === 0) {
    // Fallback: Query same category
    return await Product.find({
      _id: { $ne: productId },
      category: product?.category,
      isActive: true,
    })
      .limit(limit)
      .select('-embedding')
      .lean();
  }

  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: 'products_vector_index',
          path: 'embedding',
          queryVector: product.embedding,
          numCandidates: 30,
          limit: limit + 1,
          filter: {
            isActive: true,
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
          },
        },
      },
      {
        $project: {
          embedding: 0,
        },
      },
    ];

    const similar = await Product.aggregate(pipeline);
    return similar.filter(p => p._id.toString() !== productId).slice(0, limit);
  } catch (err) {
    console.warn('Vector search for similar products fallback:', (err as Error).message);
    return await Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
    })
      .limit(limit)
      .select('-embedding')
      .lean();
  }
}
