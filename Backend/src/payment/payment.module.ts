import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@/config/config.module';
import { OrdersModule } from '@/orders/orders.module';

@Module({
  imports: [
    ConfigModule,
    // OrdersModule also depends on this module (checkout needs to create a
    // payment session), so the pair is resolved lazily on both sides.
    forwardRef(() => OrdersModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
