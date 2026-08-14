import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { Public } from '@/auth/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse products (filter by category id, size, sort, search query q, page, limit)' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best-seller products (for homepage)' })
  async findBestSellers() {
    return this.productsService.findBestSellers();
  }

  @Roles('admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product (admin only)' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a product by slug (includes sibling colorways via styleGroup)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
