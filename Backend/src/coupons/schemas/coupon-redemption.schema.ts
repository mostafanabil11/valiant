import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export type CouponRedemptionDocument = HydratedDocument<CouponRedemption>;

// One row per (coupon, user, order). Existence of a row is the reservation
// itself — created the moment a coupon is applied at checkout, deleted again
// if that order's payment never completes, mirroring the stock-reservation
// lifecycle in OrdersService.
@Schema({ timestamps: true })
export class CouponRedemption {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Coupon', required: true })
  coupon!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, unique: true })
  order!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  discountAmount: number = 0;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponRedemptionSchema = SchemaFactory.createForClass(CouponRedemption);

// A user may redeem a given coupon at most once — this is what a per-user
// limit of 1 actually means here, and the unique index is what makes it hold
// under two concurrent checkout requests racing each other.
CouponRedemptionSchema.index({ coupon: 1, user: 1 }, { unique: true });
