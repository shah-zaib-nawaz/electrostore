'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, Package, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/use-cart-store';

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id') || 'ORD-98214';

  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Automatically clear customer cart on confirmed checkout return
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Confirmation Hero Card */}
      <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10 text-center shadow-lg space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto">
          <CheckCircle2 className="h-10 w-10 animate-in zoom-in-50" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Payment Verified & Inventory Secured
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            We&apos;ve sent a confirmation email with full tracking telemetry. Your hardware allocation is locked.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 max-w-sm mx-auto text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Order Reference:</span>
            <span className="font-mono font-bold text-foreground">#{orderId.slice(-8).toUpperCase()}</span>
          </div>
          {sessionId && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Payment Session:</span>
              <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">
                {sessionId}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
            <span className="text-muted-foreground">Est. Delivery:</span>
            <span className="font-semibold text-foreground">2 Business Days</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto font-bold text-xs gap-2">
            <a
              href={`/api/orders/${orderId}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              <span>Download Tax Invoice (PDF)</span>
            </a>
          </Button>

          <Button variant="outline" asChild size="lg" className="w-full sm:w-auto text-xs">
            <Link href="/account/orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span>View in Account</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Shipping Roadmap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Order Received</h4>
            <p className="text-[11px] text-muted-foreground">Payment verified via Stripe</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Warehouse Packing</h4>
            <p className="text-[11px] text-muted-foreground">ESD-safe packaging</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Express Transit</h4>
            <p className="text-[11px] text-muted-foreground">Signature required on arrival</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Button variant="ghost" asChild size="sm">
          <Link href="/products" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
            <span>Continue shopping catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-xs text-muted-foreground">Loading confirmation...</div>}>
        <CheckoutReturnContent />
      </Suspense>
    </div>
  );
}
