'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Cpu, Laptop, Monitor, Headphones, HardDrive, Gamepad2 } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Graphics Cards',
    slug: 'gpus',
    count: '7 Flagships',
    icon: HardDrive,
    image: '/images/collections/gpus.webp',
    color: 'from-blue-600/20 to-indigo-600/20',
  },
  {
    name: 'Laptops & Workstations',
    slug: 'laptops',
    count: '6 Flagships',
    icon: Laptop,
    image: '/images/collections/laptops.webp',
    color: 'from-purple-600/20 to-pink-600/20',
  },
  {
    name: 'Gaming Displays',
    slug: 'monitors',
    count: '6 Flagships',
    icon: Monitor,
    image: '/images/collections/monitors.webp',
    color: 'from-emerald-600/20 to-teal-600/20',
  },
  {
    name: 'Processors & CPUs',
    slug: 'cpus',
    count: '5 Flagships',
    icon: Cpu,
    image: '/images/collections/cpus.webp',
    color: 'from-amber-600/20 to-orange-600/20',
  },
  {
    name: 'Pro Audio & DACs',
    slug: 'audio',
    count: '5 Flagships',
    icon: Headphones,
    image: '/images/collections/audio.webp',
    color: 'from-rose-600/20 to-red-600/20',
  },
  {
    name: 'Peripherals & Gear',
    slug: 'accessories',
    count: '6 Flagships',
    icon: Gamepad2,
    image: '/images/collections/accessories.webp',
    color: 'from-cyan-600/20 to-blue-600/20',
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Explore Hardware Categories
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Engineered for high-throughput computing, gaming, and creator workflows.
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-3 overflow-hidden hover:border-primary/50 hover:shadow-md transition-all text-center"
            >
              {/* Image thumbnail */}
              <div className="relative aspect-square w-full rounded-lg bg-muted/30 overflow-hidden mb-2.5">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-40`} />
                <div className="absolute bottom-2 right-2 p-1.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground shadow-sm">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Title & Product Count */}
              <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                {cat.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{cat.count}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
