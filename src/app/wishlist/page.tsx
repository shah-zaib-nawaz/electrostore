'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { useWishlistStore } from '@/store/use-wishlist-store';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  const handleMoveToCart = (item: (typeof items)[0]) => {
    addItemToCart({
      productId: item.productId,
      name: item.name,
      sku: item.slug.toUpperCase().slice(0, 10),
      price: item.price,
      quantity: 1,
      image: item.image,
      stock: item.inStock ? 10 : 0,
    });
    removeItem(item.productId);
    toast.success('Moved to cart', {
      description: item.name,
    });
  };

  return (
    <StorefrontShell>
      <div className="py-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Saved Hardware Wishlist
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep track of dream rigs, pending drops, and price alerts.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearWishlist}
              className="text-xs text-muted-foreground hover:text-destructive self-start sm:self-auto"
            >
              Clear Wishlist
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Heart className="h-8 w-8 stroke-1 text-rose-500" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Your wishlist is currently empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Click the heart icon on any product in our catalog to save items for future builds.
            </p>
            <Button asChild size="sm">
              <Link href="/products" className="gap-2">
                <span>Browse Hardware Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="relative aspect-square w-full rounded-lg bg-muted/30 overflow-hidden mb-3">
                  <Link href={`/product/${item.slug}`}>
                    <Image
                      src={
                        item.image ||
                        '/images/products/rtx-5090-fe-1.webp'
                      }
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => {
                      removeItem(item.productId);
                      toast.info('Removed from wishlist');
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors shadow-sm"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Info */}
                <Link href={`/product/${item.slug}`} className="group-hover:text-primary transition-colors">
                  <h3 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                  <span className="font-extrabold text-sm text-foreground">
                    ${item.price.toFixed(2)}
                  </span>
                  <Badge variant={item.inStock ? 'outline' : 'secondary'} className="text-[10px]">
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>

                {/* Move to Cart CTA */}
                <Button
                  onClick={() => handleMoveToCart(item)}
                  size="sm"
                  className="w-full mt-3 h-8 text-xs font-semibold gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Move to Cart</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
