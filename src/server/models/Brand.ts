import { Schema, model, models, Model } from 'mongoose';
import type { IBrand } from '@/types/domain';

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
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

brandSchema.index({ slug: 1, isActive: 1 });

export const Brand: Model<IBrand> = models.Brand || model<IBrand>('Brand', brandSchema);
