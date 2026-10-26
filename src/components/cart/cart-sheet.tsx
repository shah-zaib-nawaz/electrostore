'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag, X } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function CartSheet() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotal,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);

    // Dynamic coupon logic
    const code = inputCoupon.trim().toUpperCase();
    if (code === 'ELECTRO10') {
      const discount = Math.round(subtotal * 0.1 * 100) / 100;
      applyCoupon(code, discount);
      toast.success('Coupon ELECTRO10 applied: 10% discount!');
      setInputCoupon('');
    } else if (code === 'SAVE25') {
      applyCoupon(code, 25);
      toast.success('Coupon SAVE25 applied: $25 discount!');
      setInputCoupon('');
    } else {
      toast.error('Invalid coupon code. Try ELECTRO10 or SAVE25');
    }
    setIsApplying(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <div className="flex h-full flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span>Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </SheetTitle>
          </div>
          {/* Free Shipping Progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              {amountNeededForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-primary font-semibold">${amountNeededForFreeShipping.toFixed(2)}</strong> for Free Shipping
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> You unlocked Free Express Shipping!
                </span>
              )}
              <span className="text-muted-foreground">{progressToFreeShipping}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 stroke-1" />
              </div>
              <p className="font-semibold text-base">Your cart is empty</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Explore our catalog for the latest high-performance GPUs, laptops, and flagship monitors.
              </p>
              <Button asChild onClick={closeCart} size="sm" className="mt-2">
                <Link href="/products">Explore Products</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3 bg-card hover:border-border transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted border border-border/40">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Tech
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate text-foreground leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                  <p className="text-xs font-bold text-foreground mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center rounded-md border border-border bg-background">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {items.length > 0 && (
          <div className="border-t border-border/60 pt-4 space-y-3 shrink-0">
            {/* Promo Code Input */}
            {couponCode ? (
              <div className="flex items-center justify-between rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="h-3.5 w-3.5" /> Coupon <strong>{couponCode}</strong> applied (-${discountAmount.toFixed(2)})
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  placeholder="Promo code (e.g. ELECTRO10)"
                  className="h-8 text-xs"
                />
                <Button type="submit" variant="secondary" size="sm" disabled={isApplying} className="h-8 text-xs">
                  Apply
                </Button>
              </form>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{subtotal >= 150 ? 'FREE' : '$15.00'}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-sm pt-1 border-t border-border/40">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                asChild
                className="h-11 rounded-xl text-xs font-semibold border-border/80 hover:bg-secondary transition-all"
                onClick={closeCart}
              >
                <Link href="/cart" className="flex items-center justify-center">
                  View Cart
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 transition-all"
                onClick={closeCart}
              >
                <Link href="/checkout" className="flex items-center justify-center gap-1.5">
                  <span>Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
