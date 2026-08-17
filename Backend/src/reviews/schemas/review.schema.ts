import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  // The order that proves this reviewer actually bought the product —
  // kept for traceability, never shown to other customers.
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  order!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number = 5;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string = '';

  @Prop({ required: true, trim: true, maxlength: 2000 })
  body: string = '';

  // New reviews start hidden from the storefront until an admin approves
  // them — the moderation queue this phase asks for.
  @Prop({ required: true, enum: REVIEW_STATUSES, default: 'pending' })
  status: ReviewStatus = 'pending';

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// One review per customer per product — a second attempt should edit the
// first, not create a duplicate.
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
// Backs the storefront's "approved reviews for this product, newest first" read.
ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
// Backs the admin moderation queue.
ReviewSchema.index({ status: 1, createdAt: -1 });
