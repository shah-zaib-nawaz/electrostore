import { Schema, model, models, Model, Types } from 'mongoose';

export interface ISearchLog {
  query: string;
  latencyMs: number;
  resultsCount: number;
  topResultIds: Types.ObjectId[];
  filters?: Record<string, any>;
  hasSemanticIntent: boolean;
  createdAt?: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    query: { type: String, required: true, trim: true, index: true },
    latencyMs: { type: Number, required: true },
    resultsCount: { type: Number, required: true },
    topResultIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    filters: { type: Schema.Types.Mixed },
    hasSemanticIntent: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

searchLogSchema.index({ createdAt: -1 });

export const SearchLog: Model<ISearchLog> = models.SearchLog || model<ISearchLog>('SearchLog', searchLogSchema);
