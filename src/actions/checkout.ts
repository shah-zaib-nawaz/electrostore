'use server';

import { z } from 'zod';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { env } from '@/lib/env';
import { Product } from '@/server/models/Product';
import { Coupon } from '@/server/models/Coupon';
import { Order } from '@/server/models/Order';
import { getSession } from '@/server/auth-guard';
import { addressSchema } from '@/types/domain';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia' as any,
});

const checkoutItemInputSchema = z.object({
  productId: z.string(),
  name: z.string(),
  sku: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
});

const checkoutSessionInputSchema = z.object({
  items: z.array(checkoutItemInputSchema).min(1),
  shippingAddress: addressSchema,
  couponCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemInputSchema>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionInputSchema>;

const compiledCheckoutInputValidator = typeof (z as any).compile === 'function'
  ? (z as any).compile(checkoutSessionInputSchema, { jitless: true })
  : checkoutSessionInputSchema;

export async function applyCoupon(code: string, cartTotal: number, _categoryIds: string[] = []) {
  await connectToDatabase();
  const now = new Date();

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!coupon) {
    return { valid: false, error: 'Invalid or expired coupon code' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit has been reached' };
  }

  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
    };
  }

  let discount = coupon.discountType === 'percentage'
    ? (cartTotal * coupon.discountValue) / 100
    : coupon.discountValue;

  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  discount = Math.min(discount, cartTotal);

  return {
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discount * 100) / 100,
  };
}

export type CheckoutSessionResult =
  | { success: true; clientSecret: string | null; orderId: string | null }
  | { success: false; error?: string; errors?: any };

/**
 * Creates an ACID transactional Stripe Embedded Checkout Session:
 * 1. Atomically reserves product stock inside session.withTransaction()
 * 2. Increments coupon usage
 * 3. Creates pending Order document
 * 4. Creates Stripe Embedded Checkout session returning clientSecret
 */
export async function createEmbeddedCheckoutSession(rawInput: unknown): Promise<CheckoutSessionResult> {
  const parsed = compiledCheckoutInputValidator.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }

  const { items, shippingAddress, couponCode, guestEmail } = parsed.data;
  const sessionUser = await getSession();

  await connectToDatabase();
  const mongoSession = await mongoose.startSession();

  let orderId: string | null = null;
  let clientSecret: string | null = null;

  try {
    await mongoSession.withTransaction(
      async () => {
        let subtotal = 0;
        const resolvedProducts = new Map<string, any>();

        // Step 1: Atomically verify and decrement product stock inside transaction
        for (const item of items) {
          subtotal += item.price * item.quantity;

          const query: any = {
            stock: { $gte: item.quantity },
            isActive: true,
          };

          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            query._id = new mongoose.Types.ObjectId(item.productId);
          } else {
            query.$or = [
              { sku: item.sku },
              { slug: item.sku?.toLowerCase() },
              { name: item.name },
            ];
          }

          const updatedProduct = await Product.findOneAndUpdate(
            query,
            {
              $inc: { stock: -item.quantity },
            },
            { session: mongoSession, returnDocument: 'after' }
          );

          if (!updatedProduct) {
            throw new Error(`INSUFFICIENT_STOCK: Item ${item.name} (${item.sku}) is out of stock or requested quantity unavailable.`);
          }

          resolvedProducts.set(item.productId, updatedProduct);
        }

        // Step 2: Calculate discounts and increment coupon if provided
        let discount = 0;
        if (couponCode) {
          const couponRes = await applyCoupon(couponCode, subtotal);
          if (couponRes.valid && couponRes.discountAmount) {
            discount = couponRes.discountAmount;

            await Coupon.findOneAndUpdate(
              { code: couponCode.toUpperCase() },
              { $inc: { usedCount: 1 } },
              { session: mongoSession }
            );
          }
        }

        const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
        const shipping = subtotal > 150 ? 0 : 15;
        const total = Math.max(0, Math.round((subtotal - discount + tax + shipping) * 100) / 100);

        // Step 3: Create Order document in 'pending' state
        const createdOrders: any[] = await Order.create(
          [
            {
              user: sessionUser?.user?.id ? new mongoose.Types.ObjectId(sessionUser.user.id) : undefined,
              guestEmail: sessionUser?.user?.email || guestEmail,
              items: items.map((item: any) => {
                const prod = resolvedProducts.get(item.productId);
                return {
                  productId: prod?._id || (mongoose.Types.ObjectId.isValid(item.productId) ? new mongoose.Types.ObjectId(item.productId) : new mongoose.Types.ObjectId()),
                  name: item.name,
                  sku: item.sku,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                };
              }),
              subtotal,
              discount,
              tax,
              shipping,
              total,
              couponCode,
              shippingAddress,
              status: 'pending',
              paymentStatus: 'pending',
            },
          ],
          { session: mongoSession }
        );

        const order = createdOrders[0];
        orderId = order._id.toString();

        // Helper to ensure only valid public HTTPS image URLs are sent to Stripe
        const getStripeSafeImages = (img?: string): string[] => {
          if (!img) return [];
          if (img.startsWith('https://') && !img.includes('localhost') && !img.includes('127.0.0.1')) {
            return [img];
          }
          return [];
        };

        // Step 4: Create Stripe Embedded Checkout session
        const lineItems = items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: getStripeSafeImages(item.image),
              metadata: { sku: item.sku },
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        if (tax > 0) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { name: 'Sales Tax (Est.)' },
              unit_amount: Math.round(tax * 100),
            },
            quantity: 1,
          });
        }

        if (shipping > 0) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { name: 'Standard Shipping' },
              unit_amount: Math.round(shipping * 100),
            },
            quantity: 1,
          });
        }

        const stripeCustomerId = sessionUser?.user?.stripeCustomerId;
        const customerEmail = sessionUser?.user?.email || guestEmail;

        const stripeSession = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          mode: 'payment',
          ...(stripeCustomerId
            ? { customer: stripeCustomerId }
            : customerEmail
            ? { customer_email: customerEmail }
            : {}),
          line_items: lineItems,
          return_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          metadata: {
            orderId,
            couponCode: couponCode || '',
          },
        });

        clientSecret = stripeSession.client_secret;

        // Attach stripeSessionId to order
        order.stripeSessionId = stripeSession.id;
        await order.save({ session: mongoSession });
      },
      { maxCommitTimeMS: 5000 }
    );

    return {
      success: true,
      clientSecret,
      orderId,
    };
  } catch (error) {
    console.error('[Checkout] Transaction aborted:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  } finally {
    await mongoSession.endSession();
  }
}
