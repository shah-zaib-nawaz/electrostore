'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  Flame,
  Cpu,
  Monitor,
  Laptop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroBento() {
  return (
    <section className="py-4 sm:py-6 space-y-4">
      {/* Main Flagship Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-8 lg:p-10 shadow-lg">
        {/* Subtle Ambient Background Halos */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Product Information & CTAs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Flagship Release</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500">
                8 Units In Stock
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                GeForce RTX 5090 <br />
                <span className="text-primary">Founders Edition</span>
              </h1>
              <p className="text-sm font-semibold text-muted-foreground pt-1">
                Blackwell B200 • 32GB GDDR7 • 512-bit Memory Bus
              </p>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Engineered for extreme generative AI models, native 4K 240Hz ray tracing, and 3D rendering. Features 21,760 CUDA cores and 1,792 GB/s memory bandwidth.
            </p>

            {/* Technical Specs Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-lg bg-muted/80 border border-border/80 px-2.5 py-1 text-xs font-semibold text-foreground">
                32GB GDDR7
              </span>
              <span className="rounded-lg bg-muted/80 border border-border/80 px-2.5 py-1 text-xs font-semibold text-foreground">
                21,760 CUDA
              </span>
              <span className="rounded-lg bg-muted/80 border border-border/80 px-2.5 py-1 text-xs font-semibold text-foreground">
                DP 2.1a UHD
              </span>
              <span className="rounded-lg bg-muted/80 border border-border/80 px-2.5 py-1 text-xs font-semibold text-foreground">
                575W TDP
              </span>
            </div>

            {/* Price & Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">$1,999.00</span>
                  <span className="text-sm text-muted-foreground line-through">$2,199.00</span>
                </div>
                <span className="text-xs font-semibold text-emerald-500">Same-Day Priority Courier Included</span>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild size="lg" className="rounded-xl font-bold shadow-md shadow-primary/20">
                  <Link href="/product/rtx-5090-fe" className="flex items-center gap-2">
                    <span>Order RTX 5090</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="rounded-xl font-semibold bg-card">
                  <Link href="/products">
                    <span>Browse 35 Items</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Hardware Render & Floating Stat Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[260px] sm:min-h-[320px]">
            <div className="relative w-full h-64 sm:h-80 group">
              <Image
                src="/images/products/rtx-5090-fe-1.webp"
                alt="NVIDIA GeForce RTX 5090 Founders Edition"
                fill
                className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                priority
              />

              {/* Floating Spec Pill Overlay 1 */}
              <div className="absolute top-2 right-2 rounded-xl border border-border/80 bg-card/95 backdrop-blur px-3 py-1.5 shadow-md">
                <span className="text-[10px] font-bold text-muted-foreground block">Bandwidth</span>
                <span className="text-xs font-black text-primary">1,792 GB/s</span>
              </div>

              {/* Floating Spec Pill Overlay 2 */}
              <div className="absolute bottom-2 left-2 rounded-xl border border-border/80 bg-card/95 backdrop-blur px-3 py-1.5 shadow-md">
                <span className="text-[10px] font-bold text-muted-foreground block">Display Engine</span>
                <span className="text-xs font-black text-foreground">4K @ 240Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Secondary Mini-Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Apple MacBook Pro 16" M4 Max */}
        <Link
          href="/product/macbook-pro-16-m4-max"
          className="group rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <Laptop className="h-3.5 w-3.5" />
                <span>AI Mobile Workstation</span>
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                MacBook Pro 16&quot; M4 Max
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                128GB Unified RAM • 16C CPU / 40C GPU
              </p>
            </div>
            <span className="text-sm font-black text-foreground whitespace-nowrap">$3,499.00</span>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
            <span>View Specifications</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Samsung Odyssey OLED G9 49" */}
        <Link
          href="/product/samsung-odyssey-oled-g9"
          className="group rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Monitor className="h-3.5 w-3.5" />
                <span>Gaming Displays</span>
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                Odyssey OLED G9 49&quot;
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                240Hz Refresh • 0.03ms • 32:9 Curved
              </p>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="text-sm font-black text-foreground">$1,399.00</span>
              <span className="text-[10px] text-muted-foreground line-through block">$1,799.00</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
            <span>View Specifications</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: AMD Ryzen 9 9950X Zen 5 */}
        <Link
          href="/product/amd-ryzen-9-9950x"
          className="group rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <Cpu className="h-3.5 w-3.5" />
                <span>High-Throughput CPUs</span>
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                Ryzen 9 9950X 16-Core
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Zen 5 • 5.7 GHz Boost • AM5 Platform
              </p>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="text-sm font-black text-foreground">$649.00</span>
              <span className="text-[10px] text-muted-foreground line-through block">$699.00</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
            <span>View Specifications</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </section>
  );
}
