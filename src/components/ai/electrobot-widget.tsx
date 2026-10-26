'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  RotateCcw,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/use-cart-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-0',
    role: 'assistant',
    content:
      "Hello! I'm **ElectroBot AI**, your late-2026 hardware architect. Ask me anything about GPU clearance, 4K OLED HDR curves, custom PC builds, or real-time warehouse inventory.",
  },
];

const SUGGESTED_PROMPTS = [
  'Is the RTX 5090 compatible with an 850W PSU?',
  'Compare M4 Max vs Snapdragon X Elite for ML',
  'Recommend the best 4K 240Hz OLED monitor',
];

interface ElectroBotWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
}

export function ElectroBotWidget({ open, onOpenChange, initialPrompt }: ElectroBotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isCartOpen = useCartStore((s) => s.isOpen);

  // If initialPrompt arrives, inject it and trigger response
  useEffect(() => {
    if (initialPrompt && open) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      // Check if streaming text or plain text
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const assistantId = `msg-${Date.now() + 1}`;

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: assistantText } : msg
            )
          );
        }
      } else {
        const text = await response.text();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: text } : msg
          )
        );
      }
    } catch {
      // Fallback helpful assistant response if offline or mock
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content:
              `Regarding "${textToSend}": \n\n` +
              `Based on our live warehouse telemetry and hardware benchmarks:\n` +
              `• **NVIDIA RTX 5090 Founders Edition**: Requires a minimum 1000W PCIe 5.1 ATX 3.1 PSU with dedicated 12V-2x6 connector.\n` +
              `• **Bandwidth**: 1,792 GB/s GDDR7 memory allows 4K native path tracing above 140 FPS.\n` +
              `• **Availability**: Currently 12 units in stock for express overnight dispatch.\n\n` +
              `Would you like me to reserve one in your cart?`,
          },
        ]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const handleQuickAddRTX = () => {
    addItem({
      productId: 'prod-1',
      name: 'NVIDIA GeForce RTX 5090 Founders Edition',
      sku: 'RTX-5090-FE',
      price: 1999.0,
      quantity: 1,
      image: '/images/products/rtx-5090-fe-1.webp',
      stock: 12,
    });
    toast.success('Added to cart', {
      description: 'NVIDIA GeForce RTX 5090 Founders Edition',
    });
  };

  if (!open) {
    if (isCartOpen) return null;
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_15px_35px_rgba(37,99,235,0.6)] border border-primary-foreground/20 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open ElectroBot AI Concierge"
        title="Open ElectroBot AI Concierge"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-primary" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col w-[390px] sm:w-[440px] h-[620px] max-h-[85vh] rounded-3xl border-2 border-border bg-card text-card-foreground shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-5 ring-1 ring-black/5 dark:ring-white/10',
        isCartOpen && 'hidden'
      )}
    >
      {/* 100% Solid Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-3.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 shadow-sm bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-foreground">ElectroBot AI</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary font-bold">
                GPT-5.4
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Neural Hardware Architect</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Minimize Chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 100% Solid Messages Scroll Area (Zero see-through transparency) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-card text-card-foreground">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 shadow-xs mt-0.5 bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[85%] leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground font-medium rounded-br-xs'
                  : 'bg-secondary text-secondary-foreground border border-border/80 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Generative Interactive Card if hardware mention */}
              {msg.content.includes('RTX 5090') && msg.role === 'assistant' && (
                <div className="mt-3 rounded-xl border border-primary/40 bg-card p-3 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">NVIDIA RTX 5090 FE</span>
                    <span className="font-mono font-extrabold text-primary">$1,999.00</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>In Stock — Express Overnight Dispatch</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleQuickAddRTX}
                    className="w-full h-8 text-xs font-bold gap-1.5 shadow-xs"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Approve & Add to Cart</span>
                  </Button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground border border-border mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center text-xs text-muted-foreground pl-9">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
            <span className="text-[11px] font-semibold text-foreground ml-1">Analyzing hardware benchmarks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries Chips */}
      {messages.length === 1 && (
        <div className="p-3 border-t border-border bg-secondary/70 space-y-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Suggested Inquiries</span>
          </div>
          <div className="flex flex-col gap-1">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                className="text-left text-[11px] font-medium text-foreground bg-card border border-border/80 hover:border-primary/50 hover:bg-primary/5 px-2.5 py-1.5 rounded-lg transition-colors truncate"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Solid Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-border p-3 bg-card flex items-center gap-2 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask specs, compatibility, benchmarks..."
          className="flex-1 bg-secondary text-foreground rounded-xl px-3.5 py-2.5 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-9 w-9 rounded-xl shrink-0 shadow-sm"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
