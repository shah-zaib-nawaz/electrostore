'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Heart, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/use-cart-store';
import { useWishlistStore } from '@/store/use-wishlist-store';
import { toast } from 'sonner';

export interface ProductCardProps {
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
  onOpenAiWithProduct?: (productName: string, slug: string) => void;
}

export function ProductCard({
  id,
  name,
  slug,
  brand,
  category,
  price,
  originalPrice,
  rating = 4.8,
  reviewCount = 24,
  images,
  stock,
  isFeatured,
  specs,
  onOpenAiWithProduct,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(id));
  const addWishlist = useWishlistStore((s) => s.addItem);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const primaryImage = images?.[0] || '/images/products/rtx-5090-fe-1.webp';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0) {
      toast.error('Item is currently out of stock');
      return;
    }
    addItem({
      productId: id,
      name,
      sku: slug.toUpperCase().slice(0, 10),
      price,
      quantity: 1,
      image: primaryImage,
      stock,
    });
    toast.success('Added to cart', {
      description: name,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeWishlist(id);
      toast.info(`Removed from your wishlist`);
    } else {
      addWishlist({
        productId: id,
        name,
        slug,
        price,
        image: primaryImage,
        inStock: stock > 0,
      });
      toast.success(`Saved to your wishlist!`);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1">
      {/* Top Badges & Wishlist Action */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        <Link href={`/product/${slug}`} className="relative block h-full w-full">
          <Image
            src={primaryImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {isFeatured && (
            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 shadow-sm">
              Flagship
            </Badge>
          )}
          {discountPercent && (
            <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5 shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground/80 hover:text-rose-500 hover:bg-background transition-all shadow-sm"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWishlist ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* Stock Status Pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          {stock <= 0 ? (
            <span className="rounded-full bg-destructive/90 px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground backdrop-blur-sm">
              Sold Out
            </span>
          ) : stock <= 5 ? (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              Only {stock} Left
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span className="font-semibold uppercase tracking-wider">{brand || 'ElectroStore'}</span>
          {category && <span className="capitalize">{category}</span>}
        </div>

        {/* Title */}
        <Link href={`/product/${slug}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug text-foreground">
            {name}
          </h3>
        </Link>

        {/* Spec Pill Highlights */}
        {specs && Object.keys(specs).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(specs).slice(0, 2).map(([key, val]) => (
              <span
                key={key}
                className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
              >
                {String(val)}
              </span>
            ))}
          </div>
        )}

        {/* Rating Breakdown */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold ml-1 text-foreground">{rating.toFixed(1)}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-foreground">
                ${price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenAiWithProduct && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={() => onOpenAiWithProduct(name, slug)}
                title="Ask AI about this product"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              disabled={stock <= 0}
              onClick={handleAddToCart}
              className="h-8 px-3 text-xs gap-1.5"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
