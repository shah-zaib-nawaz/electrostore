'use server';

import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { requireAdmin } from '@/server/auth-guard';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { Category } from '@/server/models/Category';
import { Brand } from '@/server/models/Brand';
import {
  productInputSchemaCompiled,
  productImportSchemaCompiled,
  categorySchema,
  brandSchema,
} from '@/types/domain';
import { generateProductEmbedding } from '@/server/ai/embeddings';

// 1. Categories
export async function getCategoriesAction() {
  await connectToDatabase();
  return await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
}

export async function createCategoryAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }

  await connectToDatabase();
  const category = await Category.create(parsed.data);
  revalidateTag('categories', 'default');
  return { success: true, categoryId: category._id.toString() };
}

// 2. Brands
export async function getBrandsAction() {
  await connectToDatabase();
  return await Brand.find().sort({ name: 1 }).lean();
}

export async function createBrandAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = brandSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }

  await connectToDatabase();
  const brand = await Brand.create(parsed.data);
  revalidateTag('brands', 'default');
  return { success: true, brandId: brand._id.toString() };
}

// 3. Products
export async function getProductsAction(page = 1, limit = 20) {
  await connectToDatabase();
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find()
      .populate('category brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-embedding')
      .lean(),
    Product.countDocuments(),
  ]);

  return { products, total, totalPages: Math.ceil(total / limit) };
}

export async function createProductAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = productInputSchemaCompiled.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }

  await connectToDatabase();
  const product = await Product.create(parsed.data);

  revalidateTag('products', 'default');
  revalidateTag(`category-${product.category}`, 'default');

  // Dispatch background embedding generation using Next.js after()
  try {
    after(async () => {
      try {
        await generateProductEmbedding(product._id.toString());
      } catch (err) {
        console.error('Async embedding generation failed:', err);
      }
    });
  } catch {
    // Graceful fallback outside request scope
  }

  return { success: true, productId: product._id.toString() };
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  await connectToDatabase();
  await Product.findByIdAndDelete(productId);
  revalidateTag('products', 'default');
  return { success: true };
}

// 4. High-Speed Bulk Import with Ahead-of-Time Compiled Zod v4
export async function bulkImportProductsAction(rows: unknown[]) {
  await requireAdmin();
  await connectToDatabase();

  const validatedRows: any[] = [];
  const errors: Array<{ index: number; error: any }> = [];

  for (let i = 0; i < rows.length; i++) {
    const res = productImportSchemaCompiled.safeParse(rows[i]);
    if (!res.success) {
      errors.push({ index: i, error: res.error.format() });
    } else {
      validatedRows.push(res.data);
    }
  }

  if (validatedRows.length === 0) {
    return { success: false, imported: 0, errors };
  }

  // Pre-load categories and brands map for fast slug resolution
  const [categories, brands] = await Promise.all([
    Category.find().lean(),
    Brand.find().lean(),
  ]);

  const catMap = new Map(categories.map((c) => [c.slug, c._id]));
  const brandMap = new Map(brands.map((b) => [b.slug, b._id]));

  const documentsToInsert = validatedRows.map((row) => ({
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    shortDescription: row.shortDescription,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    stock: row.stock,
    isActive: row.isActive,
    tags: row.tags || [],
    category: catMap.get(row.categorySlug) || categories[0]?._id,
    brand: brandMap.get(row.brandSlug) || brands[0]?._id,
    images: [{ url: '/images/products/rtx-5090-fe-1.webp', publicId: 'sample', alt: row.name }],
  }));

  const inserted = await Product.insertMany(documentsToInsert, { ordered: false });
  revalidateTag('products', 'default');

  // Trigger batch embeddings in background via after()
  try {
    after(async () => {
      for (const doc of inserted) {
        try {
          await generateProductEmbedding(doc._id.toString());
        } catch (e) {
          console.error(`Failed to embed imported product ${doc._id}:`, e);
        }
      }
    });
  } catch {
    // Outside request context
  }

  return {
    success: true,
    imported: inserted.length,
    failedCount: errors.length,
    errors,
  };
}
