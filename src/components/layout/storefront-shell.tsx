'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartSheet } from '@/components/cart/cart-sheet';
import { CommandSearch } from '@/components/search/command-search';
import { ElectroBotWidget } from '@/components/ai/electrobot-widget';
import { Toaster } from 'sonner';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const handleOpenAi = (prompt?: string) => {
    if (prompt) {
      setAiInitialPrompt(prompt);
    }
    setAiChatOpen(true);
  };

  React.useEffect(() => {
    const handleOpenCustom = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      handleOpenAi(customEvent.detail?.prompt);
    };
    window.addEventListener('electrobot:open', handleOpenCustom);
    return () => window.removeEventListener('electrobot:open', handleOpenCustom);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Global Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAiChat={() => handleOpenAi()}
      />

      {/* Main Page Area */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <CartSheet />
      <CommandSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onAskAi={(query) => handleOpenAi(query)}
      />
      <ElectroBotWidget
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        initialPrompt={aiInitialPrompt}
      />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
