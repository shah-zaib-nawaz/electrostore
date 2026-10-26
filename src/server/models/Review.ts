import { Schema, model, models, Model } from 'mongoose';
import type { IReview } from '@/types/domain';

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    images: { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    helpfulVotes: { type: Number, default: 0 },
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

reviewSchema.index({ product: 1, status: 1, rating: -1 });

export const Review: Model<IReview> = models.Review || model<IReview>('Review', reviewSchema);
