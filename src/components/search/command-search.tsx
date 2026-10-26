'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Sparkles, ArrowRight, X, Cpu, Laptop, HardDrive, CornerDownLeft } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ALL_PRODUCTS } from '@/data/products';

interface SearchItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  image?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  gpus: 'Graphics Cards',
  laptops: 'Laptops',
  monitors: 'Monitors',
  cpus: 'Processors',
  audio: 'Audio',
  accessories: 'Accessories',
};

const SAMPLE_SEARCH_CATALOG: SearchItem[] = ALL_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: CATEGORY_NAMES[p.category] || p.category,
  price: p.price,
  image: p.images[0],
}));

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAskAi?: (query: string) => void;
}

export function CommandSearch({ open, onOpenChange, onAskAi }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>(SAMPLE_SEARCH_CATALOG.slice(0, 8));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(SAMPLE_SEARCH_CATALOG.slice(0, 8));
    }
  }, [open]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Debounced search filtering across all 35 products
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!query.trim()) {
        setResults(SAMPLE_SEARCH_CATALOG.slice(0, 8));
        return;
      }
      const q = query.toLowerCase();
      const filtered = SAMPLE_SEARCH_CATALOG.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q)
      );
      setResults(filtered);
    }, 100);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelectProduct = (slug: string) => {
    onOpenChange(false);
    router.push(`/product/${slug}`);
  };

  const handleHandoffToAi = () => {
    onOpenChange(false);
    onAskAi?.(query || 'What are the best components for 4K video editing and gaming?');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="-m-6 flex flex-col bg-card text-card-foreground">
        {/* Search Header Bar with Icon and Input */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Search className="h-4 w-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, GPUs, CPUs, or tech specs..."
            className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* AI Handoff Prompt Strip */}
        <div className="border-b border-border bg-primary/5 dark:bg-primary/10 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-primary font-semibold">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Need advice or PC build compatibility check?</span>
          </div>
          <button
            onClick={handleHandoffToAi}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group"
          >
            <span>Ask ElectroBot AI</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Results List - 100% Solid Card Surface */}
        <div className="max-h-84 overflow-y-auto p-2 space-y-1 bg-card">
          {results.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                No direct catalog matches for &ldquo;{query}&rdquo;
              </p>
              <button
                onClick={handleHandoffToAi}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask ElectroBot AI to search upcoming inventory drops</span>
              </button>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectProduct(item.slug)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors text-left group border border-transparent hover:border-border/60"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-secondary border border-border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground font-bold">
                        HW
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="font-semibold uppercase tracking-wider text-[9px] bg-secondary px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="font-mono text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-secondary text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <span>Select:</span>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-foreground">
              <CornerDownLeft className="h-2.5 w-2.5 inline" /> Enter
            </kbd>
            <span className="ml-2">Navigate:</span>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-foreground">
              ↑
            </kbd>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-foreground">
              ↓
            </kbd>
          </div>
          <div>
            <span className="font-semibold text-foreground">ElectroStore AI</span> Search
          </div>
        </div>
      </div>
    </Dialog>
  );
}
