import { z } from 'zod';
import type { Types } from 'mongoose';

// Helper for MongoDB ObjectId schema
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// 1. User Domain Schema
export const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1).default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const userRoleSchema = z.enum(['customer', 'admin', 'superadmin']);

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().optional(),
  role: userRoleSchema.default('customer'),
  phone: z.string().optional(),
  addresses: z.array(addressSchema).default([]),
  wishlist: z.array(z.any()).default([]),
  stripeCustomerId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// 2. Category Domain Schema
export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  parentCategory: z.any().nullable().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

// 3. Brand Domain Schema
export const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// 4. Product Domain Schema
export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  alt: z.string().default('Product Image'),
});

export const productRatingSchema = z.object({
  avg: z.number().min(0).max(5).default(0),
  count: z.number().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  sku: z.string().min(3),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  category: z.any(),
  brand: z.any(),
  images: z.array(productImageSchema).min(1),
  specifications: z.record(z.string(), z.string()).default({}),
  stock: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  ratings: productRatingSchema.default({ avg: 0, count: 0 }),
  embedding: z.array(z.number()).length(3072).optional(),
});

export const productImportRowSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(3),
  price: z.number().or(z.string().transform(v => parseFloat(v))),
  compareAtPrice: z.number().or(z.string().transform(v => v ? parseFloat(v) : undefined)).optional(),
  categorySlug: z.string(),
  brandSlug: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  stock: z.number().or(z.string().transform(v => parseInt(v, 10))),
  isActive: z.boolean().or(z.string().transform(v => v === 'true' || v === '1')).default(true),
  tags: z.string().transform(v => v.split(',').map(s => s.trim()).filter(Boolean)).optional(),
});

// 5. Order Domain Schema
export const orderItemSchema = z.object({
  productId: z.any(),
  name: z.string(),
  sku: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
});

export const orderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
]);

export const orderSchema = z.object({
  user: z.any().optional(),
  guestEmail: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  total: z.number().min(0),
  couponCode: z.string().optional(),
  shippingAddress: addressSchema,
  status: orderStatusSchema.default('pending'),
  paymentStatus: paymentStatusSchema.default('pending'),
  stripePaymentIntentId: z.string().optional(),
  stripeSessionId: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

// 6. Review Domain Schema
export const reviewSchema = z.object({
  user: z.any(),
  product: z.any(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2),
  comment: z.string().min(5),
  images: z.array(z.string()).default([]),
  isVerifiedPurchase: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  helpfulVotes: z.number().default(0),
});

// 7. Cart Domain Schema
export const cartItemSchema = z.object({
  productId: z.any(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export const cartSchema = z.object({
  userId: z.any().optional(),
  guestSessionId: z.string().optional(),
  items: z.array(cartItemSchema).default([]),
  couponCode: z.string().optional(),
  expiresAt: z.date().optional(),
});

// 8. Coupon Domain Schema
export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase().trim(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  startDate: z.date().default(() => new Date()),
  endDate: z.date(),
  usageLimit: z.number().int().positive().optional(),
  usedCount: z.number().int().default(0),
  isActive: z.boolean().default(true),
  applicableCategories: z.array(z.any()).default([]),
});

// 9. Conversation Domain Schema
export const conversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  parts: z.array(z.any()).optional(),
  citations: z.array(z.any()).optional(),
  toolInvocations: z.array(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
});

export const conversationSchema = z.object({
  userId: z.any().optional(),
  title: z.string().default('New Shopping Session'),
  messages: z.array(conversationMessageSchema).default([]),
  context: z.object({
    lastViewedProducts: z.array(z.any()).default([]),
    currentPage: z.string().optional(),
  }).default({ lastViewedProducts: [] }),
  isActive: z.boolean().default(true),
});

// Domain Interfaces
export interface IUser extends z.infer<typeof userSchema> {
  _id?: Types.ObjectId;
}
export type IAddress = z.infer<typeof addressSchema>;
export interface ICategory extends z.infer<typeof categorySchema> {
  _id?: Types.ObjectId;
}
export interface IBrand extends z.infer<typeof brandSchema> {
  _id?: Types.ObjectId;
}
export interface IProduct extends z.infer<typeof productSchema> {
  _id?: Types.ObjectId;
}
export interface IOrder extends z.infer<typeof orderSchema> {
  _id?: Types.ObjectId;
}
export type IOrderItem = z.infer<typeof orderItemSchema>;
export interface IReview extends z.infer<typeof reviewSchema> {
  _id?: Types.ObjectId;
}
export interface ICart extends z.infer<typeof cartSchema> {
  _id?: Types.ObjectId;
}
export interface ICoupon extends z.infer<typeof couponSchema> {
  _id?: Types.ObjectId;
}
export interface IConversation extends z.infer<typeof conversationSchema> {
  _id?: Types.ObjectId;
}

// AOT Compiled Validators
export const productInputSchemaCompiled = typeof (z as any).compile === 'function'
  ? (z as any).compile(productSchema, { jitless: true })
  : productSchema;

export const productImportSchemaCompiled = typeof (z as any).compile === 'function'
  ? (z as any).compile(productImportRowSchema, { jitless: true })
  : productImportRowSchema;

export const couponValidationSchemaCompiled = typeof (z as any).compile === 'function'
  ? (z as any).compile(couponSchema, { jitless: true })
  : couponSchema;
