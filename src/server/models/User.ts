import { Schema, model, models, Model } from 'mongoose';
import type { IUser } from '@/types/domain';

const addressSubSchema = new Schema(
  {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'US' },
    phone: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: {
      type: String,
      enum: ['customer', 'admin', 'superadmin'],
      default: 'customer',
      index: true,
    },
    phone: { type: String },
    addresses: { type: [addressSubSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    stripeCustomerId: { type: String, index: true },
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

export const User: Model<IUser> = models.User || model<IUser>('User', userSchema);
