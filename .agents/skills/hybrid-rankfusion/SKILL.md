---
name: hybrid-rankfusion
description: Enforces MongoDB 8.0+/9.0 $rankFusion syntax with $vectorSearch (3072 dims, scalar quantization, weight 0.7) and $search (weight 0.3).
triggers:
  - rankFusion
  - hybrid-search
  - vectorSearch
  - atlas-search
---

# MongoDB 8.0+/9.0 Native `$rankFusion` Standard

## 1. Principles
- **Native In-Database Fusion**: NEVER merge vector and lexical results in Node.js. Use MongoDB's native `$rankFusion` aggregation stage.
- **Weights & Candidate Sizing**:
  - `$vectorSearch`: weight `0.7`, `numCandidates: 150`, `limit: 40`.
  - `$search`: weight `0.3`, `limit: 40`.
- **Pre-filtering**: Always apply filters (`isActive: true`, `category`, `price`, `brand`) inside `$vectorSearch.filter` and `$search.compound.filter` to avoid unindexed scans.
- **Failover**: If the embedding provider times out (>1800ms), fallback to the text pipeline alone to maintain 100% availability.

## 2. Pipeline Implementation
```typescript
import { Product } from '@/server/models/Product';
import { embedQuery } from '@/server/ai/embeddings';

export async function hybridProductSearch({
  query,
  filters = {},
  limit = 20,
}: {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
}) {
  const queryVector = await embedQuery(query);

  const vectorFilter: Record<string, any> = { isActive: true, ...filters };

  const pipeline = [
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
                    filter: [
                      { equals: { path: 'isActive', value: true } },
                    ],
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
        embedding: 0, // Never return 3072 floats
      },
    },
  ];

  return await Product.aggregate(pipeline);
}
```
