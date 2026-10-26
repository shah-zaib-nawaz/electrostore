'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  X,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
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
  const tax = Math.round((subtotal - discountAmount) * 0.08 * 100) / 100;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 15;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);

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
    <StorefrontShell>
      <div className="py-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Your Shopping Cart
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review hardware allocations and verify quantities before proceeding to checkout.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive self-start sm:self-auto"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-8 w-8 stroke-1" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Your cart is completely empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Discover flagship GPUs, high-refresh OLED gaming displays, and high-efficiency laptops in our catalog.
            </p>
            <Button asChild size="sm">
              <Link href="/products" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Shop</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Items Table */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Alert Bar */}
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  {amountNeededForFreeShipping > 0 ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Truck className="h-4 w-4 text-primary" />
                      Add <strong className="text-foreground">${amountNeededForFreeShipping.toFixed(2)}</strong> more for Free Express Shipping!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      You qualified for Free Express Delivery!
                    </span>
                  )}
                  <span className="font-mono text-muted-foreground">{progressToFreeShipping}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[45%] text-xs font-bold">Product</TableHead>
                      <TableHead className="text-xs font-bold text-center">Unit Price</TableHead>
                      <TableHead className="text-xs font-bold text-center">Quantity</TableHead>
                      <TableHead className="text-xs font-bold text-right pr-6">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.productId} className="hover:bg-muted/20">
                        {/* Product Thumbnail & Name */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-16 w-16 shrink-0 rounded-lg bg-muted border border-border/40 overflow-hidden">
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
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-foreground line-clamp-1">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                SKU: {item.sku}
                              </p>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive mt-1 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        {/* Unit Price */}
                        <TableCell className="text-xs text-center font-mono font-medium text-foreground">
                          ${item.price.toFixed(2)}
                        </TableCell>

                        {/* Quantity */}
                        <TableCell className="text-center">
                          <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="h-6 w-6 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="h-6 w-6 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </TableCell>

                        {/* Total Price */}
                        <TableCell className="text-right pr-6 font-mono font-bold text-xs text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-base text-foreground">Order Summary</h3>

                {/* Promo Code Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Promo Code</label>
                  {couponCode ? (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tag className="h-3.5 w-3.5" /> Coupon <strong>{couponCode}</strong> applied
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        placeholder="e.g. ELECTRO10"
                        className="h-9 text-xs"
                      />
                      <Button type="submit" variant="secondary" size="sm" disabled={isApplying} className="h-9 text-xs">
                        Apply
                      </Button>
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs pt-3 border-t border-border/60">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Promotional Discount</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Shipping</span>
                    <span className="font-mono text-foreground">
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-foreground pt-3 border-t border-border/60">
                    <span>Estimated Total</span>
                    <span className="font-mono text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button asChild size="lg" className="w-full h-11 font-bold text-sm gap-2 shadow-md">
                  <Link href="/checkout">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  Taxes and shipping calculated at checkout. Secured by Stripe 256-bit encryption.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
