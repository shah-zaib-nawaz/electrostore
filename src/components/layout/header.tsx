'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Cpu,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { useWishlistStore } from '@/store/use-wishlist-store';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenAiChat?: () => void;
}

const NAV_LINKS = [
  { href: '/products', label: 'All Products' },
  { href: '/category/gpus', label: 'GPUs' },
  { href: '/category/laptops', label: 'Laptops' },
  { href: '/category/monitors', label: 'Monitors' },
  { href: '/category/cpus', label: 'CPUs' },
  { href: '/category/audio', label: 'Audio' },
  { href: '/category/accessories', label: 'Accessories' },
];

export function Header({ onOpenSearch, onOpenAiChat }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalCartItems = useCartStore((s) => s.getTotalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const wishlistItems = useWishlistStore((s) => s.items.length);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left Section: Logo & Desktop Navigation */}
        <div className="flex items-center gap-5 lg:gap-8 shrink-0 min-w-0">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-lg sm:text-xl tracking-tight shrink-0 group focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex items-baseline">
              <span className="text-foreground font-black tracking-tight">ElectroStore</span>
              <span className="ml-1 rounded bg-primary/10 px-1 py-0.5 text-[10px] font-black uppercase text-primary border border-primary/20">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Single line guaranteed with whitespace-nowrap */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/products'
                  ? pathname === '/products'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-primary/15 text-primary font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Search Bar / Ctrl+K Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex items-center gap-2 rounded-full border border-border/70 bg-card hover:bg-muted/60 hover:border-primary/50 px-3.5 py-1.5 text-xs text-muted-foreground transition-all shrink-0 w-28 sm:w-40 md:w-44 lg:w-56 justify-between shadow-xs"
            aria-label="Open Hardware Search"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Search className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Search 35+ items...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Subtle Divider */}
          <div className="h-5 w-px bg-border/60 mx-0.5 hidden sm:block shrink-0" />

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishlistItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs animate-scale-in">
                {wishlistItems}
              </span>
            )}
          </Link>

          {/* Shopping Cart Trigger */}
          <button
            type="button"
            onClick={toggleCart}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-xs animate-scale-in">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Account */}
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="My Account"
          >
            <User className="h-4 w-4" />
          </Link>

          {/* Subtle Divider before Theme Toggle */}
          <div className="h-5 w-px bg-border/60 mx-0.5 shrink-0" />

          {/* Dark / Light Mode Switch */}
          <ThemeToggle />

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-card px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/50">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch?.();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-4 w-4 text-primary" />
              <span>Search All 35 Flagship Products</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiChat?.();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch ElectroBot AI Concierge</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
