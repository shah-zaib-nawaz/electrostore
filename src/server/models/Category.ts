import { Schema, model, models, Model } from 'mongoose';
import type { ICategory } from '@/types/domain';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    image: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
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

categorySchema.index({ slug: 1, isActive: 1 });
categorySchema.index({ parentCategory: 1, displayOrder: 1 });

export const Category: Model<ICategory> = models.Category || model<ICategory>('Category', categorySchema);
