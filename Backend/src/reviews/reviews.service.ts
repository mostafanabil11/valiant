import { Injectable, BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument, ReviewStatus } from './schemas/review.schema';
import { Order, OrderDocument } from '@/orders/schemas/order.schema';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // "Verified purchase" means money actually changed hands for this exact
  // product — paymentStatus 'paid' covers both a confirmed card payment and
  // a COD order that's been delivered (see OrdersService.updateOrderStatus,
  // which is the only place COD ever flips to 'paid').
  private async findVerifyingOrder(userId: string, productId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({
      user: userId,
      paymentStatus: 'paid',
      'items.product': productId,
    });
    if (!order) {
      throw new ForbiddenException('You can only review products from a completed order');
    }
    return order;
  }

  async create(userId: string, dto: CreateReviewDto) {
    if (!Types.ObjectId.isValid(dto.productId)) {
      throw new BadRequestException('Invalid product id');
    }

    const order = await this.findVerifyingOrder(userId, dto.productId);

    try {
      const review = await this.reviewModel.create({
        product: dto.productId,
        user: userId,
        order: order._id,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        status: 'pending',
      });
      return {
        success: true,
        message: 'Review submitted — it will appear once approved',
        data: review,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException("You've already reviewed this product");
      }
      throw err;
    }
  }

  async listApprovedForProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product id');
    }
    const reviews = await this.reviewModel
      .find({ product: productId, status: 'approved' })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: 'Reviews retrieved',
      data: reviews,
    };
  }

  // Recomputes straight off the approved-review set rather than incrementing
  // a running average — a review can move pending->approved->rejected in
  // either direction, and a recount is the only version of this that can't
  // drift out of sync with reality.
  private async recomputeAggregate(productId: Types.ObjectId): Promise<void> {
    const [agg] = await this.reviewModel.aggregate([
      { $match: { product: productId, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    await this.productModel.updateOne(
      { _id: productId },
      {
        $set: {
          averageRating: agg ? Math.round(agg.avg * 10) / 10 : 0,
          reviewCount: agg ? agg.count : 0,
        },
      },
    );
  }

  // --- Admin moderation ---

  async listForModeration(status?: ReviewStatus) {
    const filter = status ? { status } : {};
    const reviews = await this.reviewModel
      .find(filter)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: 'Reviews retrieved',
      data: reviews,
    };
  }

  async moderate(id: string, status: 'approved' | 'rejected') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review id');
    }
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = status;
    await review.save();
    await this.recomputeAggregate(review.product as Types.ObjectId);

    return {
      success: true,
      message: `Review ${status}`,
      data: review,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review id');
    }
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const productId = review.product as Types.ObjectId;
    await review.deleteOne();
    await this.recomputeAggregate(productId);

    return {
      success: true,
      message: 'Review deleted',
      data: null,
    };
  }
}
