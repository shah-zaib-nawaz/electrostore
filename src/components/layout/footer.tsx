import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, RefreshCw, Sparkles, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">AI Match & Compatibility</h4>
                <p className="text-xs text-muted-foreground">Powered by GPT-5.4 & Hybrid Vector Search</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Instant Dispatch</h4>
                <p className="text-xs text-muted-foreground">Free express delivery over $150</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Secure Stripe Checkout</h4>
                <p className="text-xs text-muted-foreground">ACID inventory reservation & passkeys</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">30-Day Hassle-Free Returns</h4>
                <p className="text-xs text-muted-foreground">1-click automated refund processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 font-bold text-lg mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground shadow-sm">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="font-black text-foreground">ElectroStore AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Late-2026 Next-Generation Electronics Store featuring real-time AI sales engineering, Mongoose 9.11, and Atlas $rankFusion search.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Shop</h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground">All Hardware</Link></li>
              <li><Link href="/category/laptops" className="hover:text-foreground">Laptops & Workstations</Link></li>
              <li><Link href="/category/gpus" className="hover:text-foreground">NVIDIA & AMD GPUs</Link></li>
              <li><Link href="/category/monitors" className="hover:text-foreground">High Refresh Displays</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Account</h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/account" className="hover:text-foreground">My Profile</Link></li>
              <li><Link href="/account/orders" className="hover:text-foreground">Order History</Link></li>
              <li><Link href="/wishlist" className="hover:text-foreground">Saved Wishlist</Link></li>
              <li><Link href="/admin" className="hover:text-foreground">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Legal & Security</h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-foreground">Passkey WebAuthn Standards</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 ElectroStore AI Inc. All rights reserved. Built with Next.js 16.4 & React 19.
        </div>
      </div>
    </footer>
  );
}
