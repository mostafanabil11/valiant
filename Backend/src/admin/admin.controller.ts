import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminCustomerQueryDto } from './dto/admin-customer-query.dto';
import { AdminAuditQueryDto } from './dto/admin-audit-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Revenue, order counts, low stock, and top products (admin only)' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers, searchable by name/email (admin only)' })
  async listCustomers(@Query() query: AdminCustomerQueryDto) {
    return this.adminService.listCustomers(query);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'List admin mutation history (admin only)' })
  async listAuditLog(@Query() query: AdminAuditQueryDto) {
    return this.adminService.listAuditLog(query);
  }
}
