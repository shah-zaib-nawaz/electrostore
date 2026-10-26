import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { HeroBento } from '@/components/storefront/hero-bento';
import { FlashDeals } from '@/components/storefront/flash-deals';
import { FeaturedCategories } from '@/components/storefront/featured-categories';
import { ProductCard } from '@/components/storefront/product-card';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { Truck, ShieldCheck, Cpu, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_PRODUCTS } from '@/data/products';

export const metadata = {
  title: 'ElectroStore AI | Next-Gen Electronics & Hardware',
  description: 'AI-first electronics store featuring next-generation GPUs, M4 Max laptops, QD-OLED gaming displays, and instant hardware advice via ElectroBot AI.',
};

export interface ProductDisplayItem {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
  stock: number;
  isFeatured?: boolean;
  specs?: Record<string, any>;
}

const FALLBACK_FLAGSHIP_PRODUCTS: ProductDisplayItem[] = ALL_PRODUCTS
  .filter((p) => p.isFeatured)
  .map((p) => ({
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

export default async function HomePage() {
  let products: ProductDisplayItem[] = FALLBACK_FLAGSHIP_PRODUCTS;

  try {
    await connectToDatabase();
    const dbProducts = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
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
        reviewCount: p.ratings?.count || 10,
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
    }
  } catch {
    // Graceful fallback to static flagship showcases
  }

  return (
    <StorefrontShell>
      {/* 1. Flagship Hardware Hero Showcase */}
      <HeroBento />

      {/* 2. Value Pillars */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-3 sm:py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 hover:border-primary/40 hover:shadow-xs transition-all">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Express Free Shipping</h4>
            <p className="text-[11px] text-muted-foreground">Orders over $150 dispatched same day</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 hover:border-emerald-500/40 hover:shadow-xs transition-all">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">3-Year Factory Warranty</h4>
            <p className="text-[11px] text-muted-foreground">Official manufacturer verified units</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 hover:border-blue-500/40 hover:shadow-xs transition-all">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">ElectroBot AI Copilot</h4>
            <p className="text-[11px] text-muted-foreground">Real-time hardware compatibility</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 hover:border-purple-500/40 hover:shadow-xs transition-all">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">30-Day Hassle-Free Returns</h4>
            <p className="text-[11px] text-muted-foreground">Instant automated refund processing</p>
          </div>
        </div>
      </section>

      {/* 3. Flash Deals Banner */}
      <div id="flash-deals" className="py-2">
        <FlashDeals />
      </div>

      {/* 4. Hardware Categories Showcase */}
      <FeaturedCategories />

      {/* 5. Flagship Hardware Spotlight */}
      <section className="py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Featured Flagships & Arrivals
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tested for peak thermal efficiency and maximum overclocking headroom.
            </p>
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/products" className="flex items-center gap-1.5 text-xs">
              <span>View Full Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((prod) => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
      </section>

      {/* 6. AI Shopping Experience Banner */}
      <section className="my-8 sm:my-10 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-blue-500/10 p-6 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              Powered by GPT-5.4 & MongoDB $rankFusion
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Tired of checking component compatibility spreadsheets?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              ElectroBot analyzes your chassis clearance, motherboard PCIe lane allocations, and power envelope in seconds. Click the bottom right widget to start a live session.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Button asChild size="sm" className="font-semibold">
                <Link href="/products?category=gpus">Build a System Now</Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="font-semibold">
                <Link href="/products">Explore Catalog</Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-52 sm:h-64 lg:h-72 w-full rounded-2xl overflow-hidden border border-border/80 shadow-md">
            <Image
              src="/images/banners/ai-architecture-banner.webp"
              alt="Neural Hardware Architecture"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-primary-foreground/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <span>Tensor Processing Units Active</span>
              <span className="text-emerald-400">Low Latency 4ms</span>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
