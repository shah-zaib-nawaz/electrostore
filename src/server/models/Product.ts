import { Schema, model, models, Model } from 'mongoose';
import type { IProduct } from '@/types/domain';

const productImageSubSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: 'Product Image' },
  },
  { _id: false }
);

const productRatingSubSchema = new Schema(
  {
    avg: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    images: { type: [productImageSubSchema], default: [] },
    specifications: { type: Map, of: String, default: {} },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [], index: true },
    ratings: { type: productRatingSubSchema, default: () => ({ avg: 0, count: 0 }) },
    embedding: {
      type: [Number],
      select: false,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: '__v',
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sku: 1, isActive: 1 });

export const Product: Model<IProduct> = models.Product || model<IProduct>('Product', productSchema);
