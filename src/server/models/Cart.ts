import { Schema, model, models, Model } from 'mongoose';
import type { ICart } from '@/types/domain';

const cartItemSubSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    guestSessionId: { type: String, sparse: true, index: true },
    items: { type: [cartItemSubSchema], default: [] },
    couponCode: { type: String },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
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

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cart: Model<ICart> = models.Cart || model<ICart>('Cart', cartSchema);
