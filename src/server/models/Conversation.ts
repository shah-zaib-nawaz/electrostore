import { Schema, model, models, Model } from 'mongoose';
import type { IConversation } from '@/types/domain';

const conversationMessageSubSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
    content: { type: String, default: '' },
    parts: { type: [Schema.Types.Mixed], default: [] },
    citations: { type: [Schema.Types.Mixed], default: [] },
    toolInvocations: { type: [Schema.Types.Mixed], default: [] },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const conversationContextSubSchema = new Schema(
  {
    lastViewedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    currentPage: { type: String },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    title: { type: String, default: 'New Shopping Session' },
    messages: { type: [conversationMessageSubSchema], default: [] },
    context: {
      type: conversationContextSubSchema,
      default: () => ({ lastViewedProducts: [] }),
    },
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

conversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation: Model<IConversation> = models.Conversation || model<IConversation>('Conversation', conversationSchema);
