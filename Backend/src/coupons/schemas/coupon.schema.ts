import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export const COUPON_TYPES = ['percentage', 'fixed', 'free_shipping'] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string = '';

  @Prop({ required: true, enum: COUPON_TYPES })
  type: CouponType = 'percentage';

  // percentage: whole points (10 = 10%). fixed: minor units off. Ignored for free_shipping.
  @Prop({ required: true, min: 0 })
  value: number = 0;

  @Prop({ default: 0, min: 0 })
  minSubtotal: number = 0;

  // Caps a percentage discount's minor-unit amount. Null = uncapped. Ignored for fixed/free_shipping.
  @Prop({ type: Number, default: null, min: 0 })
  maxDiscountCap: number | null = null;

  @Prop({ type: Date, default: null })
  startsAt: Date | null = null;

  @Prop({ type: Date, default: null })
  endsAt: Date | null = null;

  // Null = unlimited. Enforced via an atomic usedCount < usageLimit guard.
  @Prop({ type: Number, default: null, min: 0 })
  usageLimit: number | null = null;

  @Prop({ default: 0, min: 0 })
  usedCount: number = 0;

  // Empty array = every category/product is eligible. Non-empty = allow-list.
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[] = [];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Product', default: [] })
  products: Types.ObjectId[] = [];

  @Prop({ default: false })
  excludeSaleItems: boolean = false;

  @Prop({ default: true })
  isActive: boolean = true;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
