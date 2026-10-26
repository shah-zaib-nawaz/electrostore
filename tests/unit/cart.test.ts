import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/use-cart-store';

describe('useCartStore - Shopping Cart Engine', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('initializes with empty cart and zero totals', () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.getTotalItems()).toBe(0);
    expect(state.getSubtotal()).toBe(0);
    expect(state.getTotal()).toBe(0);
  });

  it('adds unique items and aggregates quantities', () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 'prod-rtx-5090',
      name: 'NVIDIA RTX 5090 FE',
      sku: 'RTX-5090',
      price: 1999.0,
      quantity: 1,
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getTotalItems()).toBe(1);
    expect(useCartStore.getState().getSubtotal()).toBe(1999.0);

    // Adding same product increments quantity
    useCartStore.getState().addItem({
      productId: 'prod-rtx-5090',
      name: 'NVIDIA RTX 5090 FE',
      sku: 'RTX-5090',
      price: 1999.0,
      quantity: 2,
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getTotalItems()).toBe(3);
    expect(useCartStore.getState().getSubtotal()).toBe(5997.0);
  });

  it('correctly calculates free shipping threshold above $150', () => {
    const store = useCartStore.getState();

    // Under $150: has $15 shipping fee
    store.addItem({
      productId: 'prod-mouse',
      name: 'Logitech G PRO',
      sku: 'MOUSE-1',
      price: 100.0,
      quantity: 1,
    });

    // Subtotal: 100, Tax (8%): 8, Shipping: 15 -> Total: 123
    expect(useCartStore.getState().getSubtotal()).toBe(100.0);
    expect(useCartStore.getState().getTotal()).toBe(123.0);

    // Over $150: free shipping ($0)
    useCartStore.getState().addItem({
      productId: 'prod-kb',
      name: 'Keychron Q1',
      sku: 'KB-1',
      price: 100.0,
      quantity: 1,
    });

    // Subtotal: 200, Tax (8%): 16, Shipping: 0 -> Total: 216
    expect(useCartStore.getState().getSubtotal()).toBe(200.0);
    expect(useCartStore.getState().getTotal()).toBe(216.0);
  });

  it('applies discounts from coupons correctly', () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 'prod-monitor',
      name: 'OLED Monitor',
      sku: 'MON-1',
      price: 1000.0,
      quantity: 1,
    });

    // Apply $100 discount
    useCartStore.getState().applyCoupon('SAVE100', 100);

    const subtotal = useCartStore.getState().getSubtotal();
    expect(subtotal).toBe(1000.0);
    expect(useCartStore.getState().couponCode).toBe('SAVE100');
    expect(useCartStore.getState().discountAmount).toBe(100);

    // Subtotal: 1000, Discount: 100, Tax (8% on 900): 72, Shipping: 0 -> Total: 972
    expect(useCartStore.getState().getTotal()).toBe(972.0);

    // Remove coupon
    useCartStore.getState().removeCoupon();
    expect(useCartStore.getState().couponCode).toBeNull();
    expect(useCartStore.getState().discountAmount).toBe(0);
    expect(useCartStore.getState().getTotal()).toBe(1080.0);
  });

  it('updates quantities and removes items when quantity reaches 0', () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 'item-1',
      name: 'Cable',
      sku: 'CBL-1',
      price: 20.0,
      quantity: 3,
    });

    useCartStore.getState().updateQuantity('item-1', 2);
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    useCartStore.getState().updateQuantity('item-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
