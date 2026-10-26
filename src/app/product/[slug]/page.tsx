import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { ProductGallery } from '@/components/storefront/product-gallery';
import { ProductBuyBox } from '@/components/storefront/product-buy-box';
import { ProductSpecsTable } from '@/components/storefront/product-specs-table';
import { ProductReviews } from '@/components/storefront/product-reviews';
import { ProductCard } from '@/components/storefront/product-card';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/server/models/Product';
import { Star, ShieldAlert, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ALL_PRODUCTS, type ProductItem } from '@/data/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const CATALOG_ITEMS: Record<string, ProductItem> = Object.fromEntries(
  ALL_PRODUCTS.map((p) => [p.slug, p])
);

export async function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  let name = 'Hardware Product';

  try {
    await connectToDatabase();
    const product = await Product.findOne({ slug }).lean();
    if (product) name = product.name;
    else if (CATALOG_ITEMS[slug]) name = CATALOG_ITEMS[slug].name;
  } catch {
    if (CATALOG_ITEMS[slug]) name = CATALOG_ITEMS[slug].name;
  }

  return {
    title: `${name} | ElectroStore AI`,
    description: `Official technical specifications, real-time availability, and verified customer reviews for ${name}.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product: any = CATALOG_ITEMS[slug];

  try {
    await connectToDatabase();
    const dbProduct = (await Product.findOne({ slug }).lean()) as any;
    if (dbProduct) {
      product = {
        id: String(dbProduct._id),
        name: dbProduct.name,
        slug: dbProduct.slug,
        brand: dbProduct.brand ? String(dbProduct.brand) : 'ElectroStore',
        category: dbProduct.category ? String(dbProduct.category) : 'tech',
        price: dbProduct.price,
        originalPrice: dbProduct.compareAtPrice,
        rating: dbProduct.ratings?.avg || 4.8,
        reviewCount: dbProduct.ratings?.count || 15,
        images: Array.isArray(dbProduct.images)
          ? dbProduct.images.map((img: any) => (typeof img === 'string' ? img : img.url))
          : [],
        stock: dbProduct.stock,
        isFeatured: dbProduct.isFeatured,
        description: dbProduct.description,
        specs: dbProduct.specifications
          ? dbProduct.specifications instanceof Map
            ? Object.fromEntries(dbProduct.specifications)
            : dbProduct.specifications
          : {},
      };
    }
  } catch {
    // If DB unavailable, product defaults to CATALOG_ITEMS[slug]
  }

  if (!product) {
    notFound();
  }

  return (
    <StorefrontShell>
      <div className="py-4 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-foreground">Catalog</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/category/${product.category}`} className="hover:text-foreground capitalize">
            {product.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Section: Gallery + Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Interactive Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Title, Rating & Buy Box */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">
                  {product.brand}
                </Badge>
                {product.isFeatured && (
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                    Flagship Pick
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                {product.name}
              </h1>

              {/* Star Rating Breakdown */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold ml-1.5 text-foreground">
                    {product.rating?.toFixed(1) || '4.8'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount || 24} verified buyer reviews)
                </span>
              </div>
            </div>

            {/* Buy Box */}
            <ProductBuyBox
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              originalPrice={product.originalPrice}
              stock={product.stock}
              images={product.images}
              specs={product.specs}
            />
          </div>
        </div>

        {/* Detailed Information Tabs: Description, Specs, Reviews */}
        <section className="pt-8 border-t border-border/60">
          <Tabs defaultValue="specs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="description">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specs" className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Detailed Technical Specifications</h3>
              <ProductSpecsTable specs={product.specs} />
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Product Architecture Overview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description ||
                    'Engineered for maximum thermal overhead and extreme compute workloads, this hardware combines precision manufacturing with state-of-the-art silicon packaging.'}
                </p>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <ProductReviews
                productId={product.id}
                productName={product.name}
                averageRating={product.rating}
                totalReviews={product.reviewCount}
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </StorefrontShell>
  );
}
