---
name: mongoose9-model
description: Enforces Mongoose 9.11+ TypeScript-first schema definitions, clean Zod v4 type inference, lean type narrowing, optimistic concurrency, and automatic JSON serialization helpers.
triggers:
  - mongoose
  - schema
  - model
  - optimisticConcurrency
---

# Mongoose 9.11+ & Zod v4 Model Engineering Standard

## 1. Schema Design Principles
- Always enable `optimisticConcurrency: true` on schemas undergoing concurrent updates to prevent lost updates via `__v`.
- Strict typing: Derive or align TypeScript domain types from compiled Zod v4 schemas (`z.infer<typeof Schema>`).
- Always configure `toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } }` and `toObject: { virtuals: true }`.
- Embeddings field pattern:
  ```typescript
  embedding: {
    type: [Number],
    required: false,
    select: false, // Omit 3072 floats by default on standard queries
  }
  ```
- Always use `models.ModelName || model<IModel>('ModelName', schema)` to prevent recompilation in Next.js Turbopack development.
- Compound indexes must be declared explicitly in code matching query patterns.

## 2. Model Template
```typescript
import { Schema, model, models, Model } from 'mongoose';
import type { IProduct } from '@/types/domain';

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    embedding: { type: [Number], select: false },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: '__v',
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ brand: 1, isActive: 1 });

export const Product: Model<IProduct> = models.Product || model<IProduct>('Product', productSchema);
```
