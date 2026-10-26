import React, { Suspense } from 'react';
import Link from 'next/link';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { ProductCard, type ProductCardProps } from '@/components/storefront/product-card';
import { ProductFilters } from '@/components/storefront/product-filters';
import { ProductGridSkeleton } from '@/components/storefront/product-grid-skeleton';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { ArrowUpDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ALL_PRODUCTS } from '@/data/products';

export const metadata = {
  title: 'Hardware Catalog | ElectroStore AI',
  description: 'Explore our complete catalog of enterprise & consumer electronics, graphics cards, custom displays, and accessories.',
};

const STATIC_CATALOG_PRODUCTS: ProductCardProps[] = ALL_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  category: p.category,
  price: p.price,
  originalPrice: p.originalPrice,
  rating: p.rating,
  reviewCount: p.reviewCount,
  images: p.images,
  stock: p.stock,
  isFeatured: p.isFeatured,
  specs: p.specs,
}));

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    minRating?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categoryFilter = params.category;
  const brandParam = params.brand;
  const brands = Array.isArray(brandParam) ? brandParam : brandParam ? [brandParam] : [];
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null;
  const inStockOnly = params.inStock === 'true';
  const minRating = params.minRating ? parseFloat(params.minRating) : null;
  const sort = params.sort || 'featured';

  let products: ProductCardProps[] = STATIC_CATALOG_PRODUCTS;

  try {
    await connectToDatabase();
    const query: Record<string, any> = { isActive: true };

    if (categoryFilter) {
      query.category = categoryFilter;
    }
    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }
    if (inStockOnly) {
      query.stock = { $gt: 0 };
    }
    if (minRating !== null) {
      query['ratings.avg'] = { $gte: minRating };
    }

    const sortOptions: Record<string, any> = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions['ratings.avg'] = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else sortOptions.isFeatured = -1;

    const dbProducts = await Product.find(query)
      .sort(sortOptions)
      .limit(50)
      .lean();

    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p: any) => ({
        id: String(p._id),
        name: p.name,
        slug: p.slug,
        brand: p.brand ? String(p.brand) : 'ElectroStore',
        category: p.category ? String(p.category) : 'tech',
        price: p.price,
        originalPrice: p.compareAtPrice,
        rating: p.ratings?.avg || 4.8,
        reviewCount: p.ratings?.count || 12,
        images: Array.isArray(p.images)
          ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url))
          : [],
        stock: p.stock,
        isFeatured: p.isFeatured,
        specs: p.specifications
          ? p.specifications instanceof Map
            ? Object.fromEntries(p.specifications)
            : p.specifications
          : undefined,
      }));
    } else {
      // Filter fallback static products by active search parameters
      products = STATIC_CATALOG_PRODUCTS.filter((p) => {
        if (categoryFilter && p.category !== categoryFilter) return false;
        if (brands.length > 0 && p.brand && !brands.includes(p.brand)) return false;
        if (minPrice !== null && p.price < minPrice) return false;
        if (maxPrice !== null && p.price > maxPrice) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (minRating !== null && (p.rating || 0) < minRating) return false;
        return true;
      });

      // Apply sort on fallback products
      if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }
  } catch {
    // If DB offline, filter fallback data
    products = STATIC_CATALOG_PRODUCTS.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (brands.length > 0 && p.brand && !brands.includes(p.brand)) return false;
      if (minPrice !== null && p.price < minPrice) return false;
      if (maxPrice !== null && p.price > maxPrice) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (minRating !== null && (p.rating || 0) < minRating) return false;
      return true;
    });

    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }

  return (
    <StorefrontShell>
      <div className="py-2">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Catalog</span>
              {categoryFilter && (
                <>
                  <span>/</span>
                  <span className="capitalize text-primary font-semibold">{categoryFilter}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {categoryFilter ? `${categoryFilter.toUpperCase()} Hardware` : 'All Products & Gear'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              Showing <strong className="text-foreground">{products.length}</strong> items
            </span>
          </div>
        </div>

        {/* 2-Column PLP Layout: Filters Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Facet Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted/40" />}>
                <ProductFilters />
              </Suspense>
            </div>
          </aside>

          {/* Right Column: Products Grid */}
          <section className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
                <SlidersHorizontal className="h-10 w-10 text-muted-foreground stroke-1" />
                <h3 className="font-bold text-base text-foreground">No matching products found</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Try clearing some filters or ask ElectroBot AI to search upcoming inventory drops.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">Reset All Filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </StorefrontShell>
  );
}
