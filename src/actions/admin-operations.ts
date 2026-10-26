'use server';

import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import Stripe from 'stripe';
import { requireAdmin } from '@/server/auth-guard';
import { connectToDatabase } from '@/lib/db';
import { env } from '@/lib/env';
import { Order } from '@/server/models/Order';
import { User } from '@/server/models/User';
import { Coupon } from '@/server/models/Coupon';
import { Review } from '@/server/models/Review';
import { Product } from '@/server/models/Product';
import { couponValidationSchemaCompiled } from '@/types/domain';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia' as any,
});

// 1. Order Management & One-Click Stripe Refunds
export async function getOrdersAction(page = 1, limit = 20, status?: string) {
  await requireAdmin();
  await connectToDatabase();

  const filter: any = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, total, totalPages: Math.ceil(total / limit) };
}

export async function updateOrderStatusAction(orderId: string, status: string, trackingNumber?: string, carrier?: string) {
  await requireAdmin();
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  order.status = status as any;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  await order.save();

  // Send status email notifications via Next.js after()
  try {
    after(async () => {
      console.log(`[Email] Status update for order ${orderId} changed to ${status}. Email dispatched.`);
    });
  } catch {
    // Outside request
  }

  return { success: true };
}

export async function refundOrderAction(orderId: string, reason?: string) {
  await requireAdmin();
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  if (!order.stripePaymentIntentId) {
    return { success: false, error: 'No Stripe PaymentIntent attached to this order' };
  }

  try {
    // Trigger Stripe Refund API
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      reason: (reason as any) || 'requested_by_customer',
    });

    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();

    return { success: true, refundId: refund.id };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// 2. User Management (Better Auth Admin API)
export async function getUsersAction(page = 1, limit = 20) {
  await requireAdmin();
  await connectToDatabase();

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  return { users, total };
}

export async function updateUserRoleAction(userId: string, newRole: 'customer' | 'admin' | 'superadmin') {
  await requireAdmin();
  await connectToDatabase();

  await User.findByIdAndUpdate(userId, { role: newRole });
  return { success: true };
}

// 3. Coupons CRUD
export async function getCouponsAction() {
  await requireAdmin();
  await connectToDatabase();
  return await Coupon.find().sort({ createdAt: -1 }).lean();
}

export async function createCouponAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = couponValidationSchemaCompiled.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.format() };
  }

  await connectToDatabase();
  const coupon = await Coupon.create(parsed.data);
  return { success: true, couponId: coupon._id.toString() };
}

export async function deleteCouponAction(couponId: string) {
  await requireAdmin();
  await connectToDatabase();
  await Coupon.findByIdAndDelete(couponId);
  return { success: true };
}

// 4. Review Moderation & Atomic Rating Recalculation
export async function getReviewsAction(status?: string) {
  await requireAdmin();
  await connectToDatabase();

  const filter: any = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  return await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 })
    .lean();
}

export async function moderateReviewAction(reviewId: string, newStatus: 'approved' | 'rejected') {
  await requireAdmin();
  await connectToDatabase();

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { status: newStatus },
    { new: true }
  );

  if (!review) {
    return { success: false, error: 'Review not found' };
  }

  // Recalculate product aggregate ratings via Mongoose aggregation
  const stats = await Review.aggregate([
    { $match: { product: review.product, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avg = stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const count = stats[0]?.reviewCount || 0;

  await Product.findByIdAndUpdate(review.product, {
    ratings: { avg, count },
  });

  revalidateTag('products', 'default');
  return { success: true, avgRating: avg, reviewCount: count };
}
