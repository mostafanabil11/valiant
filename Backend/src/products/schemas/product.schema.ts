import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';
import { ProductSizeStock, ProductSizeStockSchema } from './product-size-stock.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string = '';

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string = '';

  @Prop({ type: String, default: null })
  description: string | null = null;

  // Each product is a single colorway (e.g. "Navy Knitted Polo T-Shirt" is its
  // own product, "White Knitted Polo T-Shirt" is a separate one) rather than a
  // multi-color variant on one product.
  @Prop({ required: true, trim: true })
  color: string = '';

  // Optional shared key linking sibling colorways of the same style
  // (e.g. both the Navy and White polo share styleGroup "knitted-polo-t-shirt")
  // so the product page can show "also available in" links between them.
  @Prop({ type: String, default: null })
  styleGroup: string | null = null;

  // Must reference a leaf/subcategory (e.g. "Men > Hoodies"), never a
  // top-level category like "Men" itself — enforced in ProductsService.
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  price: number = 0;

  @Prop({ type: Number, default: null, min: 0 })
  discountPrice: number | null = null;

  @Prop({ type: [String], required: true })
  images: string[] = [];

  @Prop({ type: [ProductSizeStockSchema], required: true })
  sizes: ProductSizeStock[] = [];

  @Prop({ default: false })
  isBestSeller: boolean = false;

  @Prop({ default: true })
  isActive: boolean = true;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
