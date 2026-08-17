import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '@/orders/schemas/order.schema';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { User, UserDocument } from '@/auth/schemas/user.schema';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { AdminCustomerQueryDto } from './dto/admin-customer-query.dto';
import { AdminAuditQueryDto } from './dto/admin-audit-query.dto';

// A product counts as low stock the moment any one size is at or below this
// many units — deliberately includes 0 (out of stock) rather than a
// separate list, since both need the same admin attention.
const LOW_STOCK_THRESHOLD = 5;
const TOP_PRODUCTS_LIMIT = 5;
const LOW_STOCK_LIMIT = 20;

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async getDashboard() {
    // Card orders count once Paymob confirms payment; COD orders count once
    // delivered flips them to 'paid' (see OrdersService.updateOrderStatus)
    // — so this single filter is "money actually collected" for both paths.
    const [revenueAgg, statusCounts, totalOrders, lowStock, topProducts] = await Promise.all([
      this.orderModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      this.orderModel.aggregate([{ $group: { _id: '$fulfillmentStatus', count: { $sum: 1 } } }]),
      this.orderModel.countDocuments(),
      this.productModel
        .find({ isActive: true, sizes: { $elemMatch: { stock: { $lte: LOW_STOCK_THRESHOLD } } } }, 'name slug sizes')
        .limit(LOW_STOCK_LIMIT),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            slug: { $first: '$items.slug' },
            image: { $first: '$items.image' },
            quantitySold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.lineTotal' },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: TOP_PRODUCTS_LIMIT },
      ]),
    ]);

    const ordersByStatus = Object.fromEntries(statusCounts.map((row) => [row._id, row.count]));

    return {
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        revenue: revenueAgg[0]?.total ?? 0,
        totalOrders,
        ordersByStatus,
        lowStock,
        topProducts,
      },
    };
  }

  async listCustomers(query: AdminCustomerQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.q) {
      const regex = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('email firstName lastName role isEmailVerified authProvider createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return {
      success: true,
      message: 'Customers retrieved',
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async listAuditLog(query: AdminAuditQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.action) filter.action = query.action;

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.auditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.auditLogModel.countDocuments(filter),
    ]);

    return {
      success: true,
      message: 'Audit log retrieved',
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
