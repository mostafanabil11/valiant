import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { RequestUser } from '@/auth/interfaces/request-user.interface';
import { Roles } from '@/common/decorators/roles.decorator';
import { Audit } from '@/common/decorators/audit.decorator';
import { AuditInterceptor } from '@/common/interceptors/audit.interceptor';

@ApiTags('Orders')
@ApiBearerAuth()
@UseInterceptors(AuditInterceptor)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(201)
  @ApiOperation({ summary: "Place an order from the user's server cart (cash on delivery or card)" })
  async checkout(@CurrentUser() user: RequestUser, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the current user's orders" })
  async findAll(@CurrentUser() user: RequestUser) {
    return this.ordersService.findAllForUser(user.userId);
  }

  // Registered ahead of the customer-scoped GET :orderNumber route below —
  // otherwise "admin" would be swallowed as an order number param.
  @Roles('admin')
  @Get('admin')
  @ApiOperation({ summary: 'List every order, filterable by payment/fulfillment status (admin only)' })
  async findAllAdmin(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.findAllAdmin(query);
  }

  @Roles('admin')
  @Get('admin/:orderNumber')
  @ApiOperation({ summary: 'Get any order by its order number, regardless of owner (admin only)' })
  async findOneAdmin(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOneAdmin(orderNumber);
  }

  // Polled by the checkout page while the customer is in the payment frame.
  // The browser redirect can be lost (closed tab, blocked popup), so the UI
  // never relies on it alone to learn the outcome.
  @Get(':orderNumber/payment-status')
  @ApiOperation({ summary: 'Poll the payment status of a card order' })
  async paymentStatus(@CurrentUser() user: RequestUser, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.getPaymentStatus(user.userId, orderNumber);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get one order by its order number' })
  async findOne(@CurrentUser() user: RequestUser, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOneForUser(user.userId, orderNumber);
  }

  @Post(':orderNumber/cancel')
  @ApiOperation({ summary: 'Cancel one of your own orders while it is still unpaid and unshipped' })
  async cancel(@CurrentUser() user: RequestUser, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.cancelOrder(user.userId, orderNumber);
  }

  @Roles('admin')
  @Audit('order.status_update')
  @Patch(':orderNumber/status')
  @ApiOperation({ summary: 'Update fulfillment/payment status of any order (admin only)' })
  async updateStatus(@Param('orderNumber') orderNumber: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(orderNumber, dto);
  }
}
