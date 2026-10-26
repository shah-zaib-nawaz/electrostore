'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Heart, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/use-cart-store';
import { useWishlistStore } from '@/store/use-wishlist-store';
import { toast } from 'sonner';

interface ProductBuyBoxProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  specs?: Record<string, string | number | boolean>;
  onAskAi?: (prompt: string) => void;
}

export function ProductBuyBox({
  id,
  name,
  slug,
  price,
  originalPrice,
  stock,
  images,
  onAskAi,
}: ProductBuyBoxProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(id));
  const addWishlist = useWishlistStore((s) => s.addItem);
  const removeWishlist = useWishlistStore((s) => s.removeItem);

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    addItem({
      productId: id,
      name,
      sku: slug.toUpperCase().slice(0, 10),
      price,
      quantity,
      image: images?.[0],
      stock,
    });
    toast.success('Added to cart', {
      description: quantity > 1 ? `${quantity}x ${name}` : name,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeWishlist(id);
      toast.info('Removed from wishlist');
    } else {
      addWishlist({
        productId: id,
        name,
        slug,
        price,
        image: images?.[0],
        inStock: stock > 0,
      });
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="space-y-6">
      {/* Price & Discount Bar */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-black text-foreground">
          ${price.toFixed(2)}
        </span>
        {originalPrice && originalPrice > price && (
          <>
            <span className="text-lg text-muted-foreground line-through font-medium">
              ${originalPrice.toFixed(2)}
            </span>
            <Badge variant="destructive" className="font-bold text-xs">
              Save {discountPercent}% (${(originalPrice - price).toFixed(2)})
            </Badge>
          </>
        )}
      </div>

      {/* Live Inventory Status */}
      <div className="flex items-center gap-2">
        {stock > 5 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            In Stock — Ready for Express Dispatch
          </span>
        ) : stock > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            Urgent: Only {stock} units left in warehouse
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Sold Out — Next batch arriving soon
          </span>
        )}
      </div>

      {/* Quantity Selector & Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={stock <= 0 || quantity <= 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              -
            </button>
            <span className="w-10 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              disabled={stock <= 0 || quantity >= stock}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>

          <Button
            size="lg"
            disabled={stock <= 0}
            onClick={handleAddToCart}
            className="flex-1 h-11 font-bold text-sm gap-2 shadow-md"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add to Cart</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleWishlist}
            className="h-11 w-11 shrink-0 rounded-xl"
            aria-label="Wishlist"
          >
            <Heart
              className={`h-5 w-5 ${
                isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
              }`}
            />
          </Button>
        </div>

        {/* Buy Now Instant Action */}
        <Button
          variant="secondary"
          size="lg"
          disabled={stock <= 0}
          onClick={handleBuyNow}
          className="w-full h-11 font-bold text-sm gap-2"
        >
          <Zap className="h-4 w-4 text-amber-500" />
          <span>Buy Now with 1-Click</span>
        </Button>
      </div>

      {/* Contextual Ask ElectroBot AI CTA */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Questions about compatibility or benchmarks?</span>
        </div>
        <p className="text-xs text-muted-foreground">
          ElectroBot AI can check power supply wattage, PCIe bottlenecks, and chassis clearance for {name}.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onAskAi?.(
              `Can you tell me about the ${name} and whether it is compatible with standard ATX builds and gaming workloads?`
            )
          }
          className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1.5 w-full"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask ElectroBot AI About This Product</span>
        </Button>
      </div>

      {/* Assurance Icons */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/20">
          <Truck className="h-4 w-4 text-primary mb-1" />
          <span className="text-[11px] font-bold text-foreground">Express Transit</span>
          <span className="text-[10px] text-muted-foreground">1-2 Business Days</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/20">
          <ShieldCheck className="h-4 w-4 text-emerald-500 mb-1" />
          <span className="text-[11px] font-bold text-foreground">Official Warranty</span>
          <span className="text-[10px] text-muted-foreground">3 Years Direct</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/20">
          <RotateCcw className="h-4 w-4 text-blue-500 mb-1" />
          <span className="text-[11px] font-bold text-foreground">30-Day Returns</span>
          <span className="text-[10px] text-muted-foreground">Zero Restocking Fee</span>
        </div>
      </div>
    </div>
  );
}
