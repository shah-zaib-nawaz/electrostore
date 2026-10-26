---
name: server-action-dal
description: Enforces authenticated Server Actions using src/server/auth-guard.ts, compiled Zod v4 input validation (z.compile), Next.js 16 revalidateTag(), and after() for non-blocking background work.
triggers:
  - server-action
  - dal
  - auth-guard
  - revalidateTag
  - after
---

# Server Action Data Access Layer (DAL) Standard

## 1. Principles
- **Mandatory Guarding**: Every mutation action must invoke `await requireAuth()` or `await requireAdmin()`.
- **Zod v4 AOT Compilation**: Compile schemas ahead-of-time with `z.compile(schema, { jitless: true })` for lightning-fast parsing.
- **Surgical Invalidation**: Call `revalidateTag('tag-name')` to invalidate cached RSCs without busting unnecessary routes.
- **Non-blocking Side Effects**: Never await email sending, background embeddings, or telemetry in the critical path. Always dispatch them using `after()`.

## 2. Server Action Template
```typescript
'use server';

import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { requireAdmin } from '@/server/auth-guard';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { productInputSchemaCompiled } from '@/types/domain';
import { generateProductEmbedding } from '@/server/ai/embeddings';

export async function createProductAction(rawInput: unknown) {
  const admin = await requireAdmin();
  
  const parsed = productInputSchemaCompiled.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }

  await connectToDatabase();
  const product = await Product.create(parsed.data);

  revalidateTag('products');
  revalidateTag(`category-${product.category}`);

  // Dispatch background embedding generation
  after(async () => {
    try {
      await generateProductEmbedding(product._id.toString());
    } catch (err) {
      console.error('Async embedding generation failed:', err);
    }
  });

  return { success: true, productId: product._id.toString() };
}
```
