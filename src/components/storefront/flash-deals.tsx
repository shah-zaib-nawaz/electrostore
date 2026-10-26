'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/use-cart-store';
import { toast } from 'sonner';

interface FlashDealItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  claimedPercentage: number;
  image: string;
  stock: number;
}

const SAMPLE_FLASH_DEALS: FlashDealItem[] = [
  {
    id: 'deal-1',
    name: 'Sony WH-1000XM5 Noise-Canceling Wireless Headphones',
    slug: 'sony-wh-1000xm5',
    price: 278.0,
    originalPrice: 399.99,
    claimedPercentage: 84,
    image: '/images/products/sony-wh-1000xm5-1.webp',
    stock: 6,
  },
  {
    id: 'deal-2',
    name: 'Samsung Odyssey OLED G9 49" Dual QHD 240Hz Curved Display',
    slug: 'samsung-odyssey-oled-g9',
    price: 1399.0,
    originalPrice: 1799.0,
    claimedPercentage: 92,
    image: '/images/products/samsung-odyssey-oled-g9-1.webp',
    stock: 3,
  },
  {
    id: 'deal-3',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    slug: 'keychron-q1-pro',
    price: 169.0,
    originalPrice: 219.0,
    claimedPercentage: 68,
    image: '/images/products/keychron-q1-pro-1.webp',
    stock: 12,
  },
  {
    id: 'deal-4',
    name: 'Logitech G PRO X Superlight 2 Wireless Gaming Mouse',
    slug: 'logitech-g-pro-x-superlight-2',
    price: 129.99,
    originalPrice: 159.99,
    claimedPercentage: 77,
    image: '/images/products/logitech-g-pro-x-superlight-2-1.webp',
    stock: 15,
  },
];

export function FlashDeals() {
  const addItem = useCartStore((s) => s.addItem);

  // Countdown timer state: 7 hours 45 mins left for today's drop
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = (deal: FlashDealItem) => {
    addItem({
      productId: deal.id,
      name: deal.name,
      sku: deal.slug.toUpperCase().slice(0, 10),
      price: deal.price,
      quantity: 1,
      image: deal.image,
      stock: deal.stock,
    });
    toast.success('Flash deal added to cart', {
      description: deal.name,
    });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-rose-500/[0.03] p-5 sm:p-7 lg:p-8 shadow-sm">
      {/* Subtle Ambient Warm Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xs">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Flash Deals
                </h2>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wide">
                  Live Now
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Limited quantity drops refreshed daily at midnight UTC.
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2 bg-card border border-border/80 px-3.5 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ends In:
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-foreground">
              <span className="bg-muted px-1.5 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-muted px-1.5 py-0.5 rounded">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-muted px-1.5 py-0.5 rounded text-rose-500">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_FLASH_DEALS.map((deal) => {
            const discount = Math.round(
              ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
            );
            return (
              <div
                key={deal.id}
                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-4 hover:border-rose-500/40 hover:shadow-md transition-all"
              >
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-rose-500 text-white font-bold text-[10px] shadow-xs">
                    SAVE {discount}%
                  </Badge>
                </div>

                {/* Image */}
                <div className="relative aspect-square w-full rounded-xl bg-muted/40 overflow-hidden mb-3">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                  {deal.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-extrabold text-foreground">
                    ${deal.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Claimed Urgency Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>{deal.claimedPercentage}% claimed</span>
                    <span className="text-rose-500 font-semibold">{deal.stock} left</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${deal.claimedPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add Button */}
                <Button
                  onClick={() => handleQuickAdd(deal)}
                  size="sm"
                  className="w-full mt-4 h-8 text-xs font-semibold gap-1.5 rounded-xl shadow-xs"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Claim Deal</span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
