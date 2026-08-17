import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditListener } from './listeners/audit.listener';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { Order, OrderSchema } from '@/orders/schemas/order.schema';
import { Product, ProductSchema } from '@/products/schemas/product.schema';
import { User, UserSchema } from '@/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      // Read-only here: dashboard aggregation and the audit listener need
      // direct model access across domains that don't otherwise depend on
      // each other. No writes happen to Order/Product/User through this
      // module — those stay owned by OrdersService/ProductsService/AuthService.
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AuditListener],
})
export class AdminModule {}
