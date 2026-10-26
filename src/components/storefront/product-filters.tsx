'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AVAILABLE_BRANDS = [
  'NVIDIA',
  'Apple',
  'AMD',
  'ASUS',
  'MSI',
  'Intel',
  'Gigabyte',
  'Dell',
  'Lenovo',
  'Razer',
  'Samsung',
  'LG',
  'BenQ',
  'Sony',
  'Sennheiser',
  'Bose',
  'FiiO',
  'Shure',
  'Keychron',
  'Logitech',
  'Corsair',
  'Crucial',
  'Elgato',
];

const AVAILABLE_CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Graphics Cards', slug: 'gpus' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Monitors', slug: 'monitors' },
  { name: 'Processors', slug: 'cpus' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Accessories', slug: 'accessories' },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active filter params
  const currentCategory = searchParams.get('category') || '';
  const currentBrands = searchParams.getAll('brand');
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minRating = searchParams.get('minRating') || '';

  const updateFilters = (newParams: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    // Reset pagination to page 1 on filter changes
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleBrand = (brand: string) => {
    const nextBrands = currentBrands.includes(brand)
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];
    updateFilters({ brand: nextBrands });
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get('minPrice')?.toString() || '';
    const max = formData.get('maxPrice')?.toString() || '';
    updateFilters({ minPrice: min || null, maxPrice: max || null });
  };

  const handleReset = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    Boolean(currentCategory) ||
    currentBrands.length > 0 ||
    Boolean(currentMinPrice) ||
    Boolean(currentMaxPrice) ||
    inStockOnly ||
    Boolean(minRating);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Category
        </label>
        <div className="space-y-1">
          {AVAILABLE_CATEGORIES.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => updateFilters({ category: cat.slug || null })}
                className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded-md transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-border/40">
        <label className="flex items-center justify-between text-xs font-medium cursor-pointer py-1">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : null })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
          />
        </label>
      </div>

      {/* Brands Multi-Select */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Brand
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {AVAILABLE_BRANDS.map((brand) => {
            const isChecked = currentBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer py-1 px-1 rounded hover:bg-muted/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBrand(brand)}
                  className="h-3.5 w-3.5 rounded border-border text-primary accent-primary"
                />
                <span className={isChecked ? 'font-semibold text-foreground' : ''}>{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Price Range ($)
        </label>
        <form onSubmit={handlePriceSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="minPrice"
              type="number"
              placeholder="Min"
              defaultValue={currentMinPrice}
              className="h-8 text-xs"
            />
            <Input
              name="maxPrice"
              type="number"
              placeholder="Max"
              defaultValue={currentMaxPrice}
              className="h-8 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="w-full h-7 text-xs">
            Apply Price
          </Button>
        </form>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Customer Rating
        </label>
        <div className="space-y-1">
          {[4, 3].map((stars) => {
            const isSelected = minRating === String(stars);
            return (
              <button
                key={stars}
                onClick={() => updateFilters({ minRating: isSelected ? null : String(stars) })}
                className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-md transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{stars} Stars & Up</span>
                </span>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
