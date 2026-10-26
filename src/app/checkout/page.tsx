'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { useCartStore } from '@/store/use-cart-store';
import { createEmbeddedCheckoutSession } from '@/actions/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, couponCode, discountAmount } = useCartStore();
  const subtotal = getSubtotal();
  const total = getTotal();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Address Form State
  const [address, setAddress] = useState({
    name: 'Alex Johnson',
    street: '742 Silicon Valley Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'US',
    phone: '+1 415 555 0199',
    email: 'alex.johnson@example.com',
  });

  const handleInputChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createEmbeddedCheckoutSession({
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        shippingAddress: {
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        },
        couponCode: couponCode || undefined,
        guestEmail: address.email,
      });

      if (res.success) {
        if (res.clientSecret) {
          setClientSecret(res.clientSecret);
          setCreatedOrderId(res.orderId || null);
          toast.success('Embedded Stripe Checkout session initialized');
        } else if (res.orderId) {
          setCreatedOrderId(res.orderId);
          router.push(`/checkout/return?session_id=cs_mock_${Date.now()}&order_id=${res.orderId}`);
        }
      } else {
        // Dev fallback if mock key
        const simulatedOrderId = `ord_sim_${Date.now()}`;
        setCreatedOrderId(simulatedOrderId);
        setErrorMsg(res.error || 'Live Stripe API call simulated for local development environment.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment session initialization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="h-8 w-8 stroke-1" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Button asChild size="sm">
          <Link href="/products">Return to Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Checkout Minimal Top Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur py-4">
        <div className="container mx-auto max-w-6xl px-4 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Cart</span>
          </Link>

          <div className="flex items-center gap-2 text-sm font-black tracking-tight">
            <span>ElectroStore</span>
            <span className="text-primary font-black">AI</span>
            <span className="text-xs font-medium text-muted-foreground ml-2 border-l border-border pl-2">
              Encrypted Checkout
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Lock className="h-3.5 w-3.5" />
            <span>256-bit TLS</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Address Form OR Embedded Stripe Session */}
          <div className="lg:col-span-7 space-y-6">
            {clientSecret ? (
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">Stripe Embedded Checkout</h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    Order #{createdOrderId?.slice(-6).toUpperCase()}
                  </span>
                </div>

                {/* Embedded Checkout Component */}
                <div id="checkout" className="rounded-xl overflow-hidden min-h-[400px]">
                  <EmbeddedCheckoutProvider
                    stripe={getStripe()}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                {/* Shipping Details Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                    <Truck className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">1. Shipping & Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                      <Input
                        value={address.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Street Address</label>
                      <Input
                        value={address.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">City</label>
                      <Input
                        value={address.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">State</label>
                        <Input
                          value={address.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Postal Code</label>
                        <Input
                          value={address.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                      <Input
                        type="email"
                        value={address.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                      <Input
                        value={address.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Notice</span>
                    </div>
                    <p>{errorMsg}</p>
                    {createdOrderId && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/checkout/return?session_id=cs_test_mock_${Date.now()}&order_id=${createdOrderId}`
                          )
                        }
                        className="text-xs mt-2"
                      >
                        Simulate Payment Confirmation & Return
                      </Button>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 font-bold text-sm gap-2 shadow-md"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isSubmitting ? 'Securing Inventory...' : 'Continue to Payment'}</span>
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Order Items Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-foreground">
                Order Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-12 w-12 shrink-0 rounded-md bg-muted border border-border/40 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                            Tech
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-foreground shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Totals */}
              <div className="space-y-2 pt-4 border-t border-border/60 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount ({couponCode})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-mono text-foreground">
                    {subtotal >= 150 ? 'FREE' : '$15.00'}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Sales Tax (Est.)</span>
                  <span className="font-mono text-foreground">
                    ${(Math.round((subtotal - discountAmount) * 0.08 * 100) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-foreground pt-3 border-t border-border/60">
                  <span>Total Amount</span>
                  <span className="font-mono text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Authorized Stripe Merchant • Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
