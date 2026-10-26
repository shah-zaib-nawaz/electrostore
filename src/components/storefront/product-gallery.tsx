'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ShieldCheck, Sparkles, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const fallbackImage =
    '/images/products/rtx-5090-fe-1.webp';
  const displayImages = images?.length > 0 ? images : [fallbackImage];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Showcase View */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={displayImages[selectedIndex] || fallbackImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            'object-contain p-4 transition-transform duration-500 ease-out',
            isZoomed ? 'scale-125 cursor-crosshair' : 'scale-100'
          )}
        />

        {/* Hover Hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm shadow-sm pointer-events-none">
          <ZoomIn className="h-3 w-3" />
          <span>Hover to inspect</span>
        </div>

        {/* Authenticity Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-sm shadow-sm">
          <ShieldCheck className="h-3 w-3" />
          <span>100% Genuine Retail Unit</span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted/30 transition-all p-1',
                selectedIndex === idx
                  ? 'border-primary ring-2 ring-primary/20 scale-95'
                  : 'border-border/60 hover:border-border'
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
