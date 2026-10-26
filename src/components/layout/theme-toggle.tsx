'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-lg border border-border/40 bg-muted/20 ${className || ''}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-foreground hover:bg-muted hover:border-border transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        className || ''
      }`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 rotate-0 scale-100 transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200 rotate-0 scale-100 transition-all duration-300" />
      )}
    </button>
  );
}
