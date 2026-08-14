import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { slugify } from '@/common/utils/slugify.util';
import { CategoriesService } from '@/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
  ) {}

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const query: Record<string, unknown> = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existing = await this.productModel.findOne(query);
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private async validateCategory(categoryId: string) {
    const category = await this.categoriesService.findByIdOrThrow(categoryId);
    if (category.parent === null) {
      throw new BadRequestException(
        'Products must be assigned to a subcategory (e.g. "Men > Hoodies"), not a top-level category like "Men".',
      );
    }
    return category;
  }

  private validatePricing(price: number, discountPrice?: number | null) {
    if (discountPrice != null && discountPrice >= price) {
      throw new BadRequestException('Discount price must be lower than the regular price');
    }
  }

  async create(dto: CreateProductDto) {
    const category = await this.validateCategory(dto.category);
    this.validatePricing(dto.price, dto.discountPrice);

    const baseSlug = slugify(dto.name);
    if (!baseSlug) {
      throw new BadRequestException('Product name must contain at least one letter or number');
    }
    const slug = await this.ensureUniqueSlug(baseSlug);

    const product = new this.productModel({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      color: dto.color,
      styleGroup: dto.styleGroup ? slugify(dto.styleGroup) : null,
      category: category._id,
      price: dto.price,
      discountPrice: dto.discountPrice ?? null,
      images: dto.images,
      sizes: dto.sizes,
      isBestSeller: dto.isBestSeller ?? false,
    });

    await product.save();

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product id');
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let categoryId = product.category;
    if (dto.category !== undefined) {
      const category = await this.validateCategory(dto.category);
      categoryId = category._id as Types.ObjectId;
    }

    const nextPrice = dto.price ?? product.price;
    const nextDiscountPrice = dto.discountPrice !== undefined ? dto.discountPrice : product.discountPrice;
    this.validatePricing(nextPrice, nextDiscountPrice);

    if (dto.name !== undefined) {
      const baseSlug = slugify(dto.name);
      if (!baseSlug) {
        throw new BadRequestException('Product name must contain at least one letter or number');
      }
      product.slug = await this.ensureUniqueSlug(baseSlug, id);
      product.name = dto.name;
    }

    product.category = categoryId;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.color !== undefined) product.color = dto.color;
    if (dto.styleGroup !== undefined) {
      product.styleGroup = dto.styleGroup ? slugify(dto.styleGroup) : null;
    }
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.discountPrice !== undefined) product.discountPrice = dto.discountPrice;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.sizes !== undefined) product.sizes = dto.sizes;
    if (dto.isBestSeller !== undefined) product.isBestSeller = dto.isBestSeller;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    await product.save();

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product id');
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // NOTE: once the Order module exists, this should block deletion (or require
    // deactivation instead) for products referenced by any existing order.
    await product.deleteOne();

    return {
      success: true,
      message: 'Product deleted successfully',
      data: null,
    };
  }

  async findAll(query: ProductQueryDto) {
    const filter: FilterQuery<ProductDocument> = { isActive: true };

    if (query.category) {
      const categoryIds = await this.categoriesService.resolveIdWithDescendants(query.category);
      filter.category = { $in: categoryIds };
    }

    if (query.size) {
      filter.sizes = { $elemMatch: { size: query.size, stock: { $gt: 0 } } };
    }

    if (query.q) {
      // Backed by the text index on name/description/color — indexed word
      // matching instead of a full-collection regex scan. Still OR'd with
      // a category-name match so e.g. searching "pants" surfaces products
      // filed under that category even when the word isn't in the product's
      // own name.
      const matchingCategoryIds = await this.categoriesService.findIdsByNameMatch(query.q);
      filter.$or = [
        { $text: { $search: query.q } },
        ...(matchingCategoryIds.length > 0 ? [{ category: { $in: matchingCategoryIds } }] : []),
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sort === 'price_asc') sort = { price: 1 };
    if (query.sort === 'price_desc') sort = { price: -1 };

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug'),
      this.productModel.countDocuments(filter),
    ]);

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findBestSellers(limit = 8) {
    const items = await this.productModel
      .find({ isActive: true, isBestSeller: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug');

    return {
      success: true,
      message: 'Best sellers retrieved successfully',
      data: items,
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .populate('category', 'name slug parent');
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let relatedColors: unknown[] = [];
    if (product.styleGroup) {
      relatedColors = await this.productModel
        .find({
          styleGroup: product.styleGroup,
          isActive: true,
          _id: { $ne: product._id },
        })
        .select('name slug color images')
        .lean();
    }

    return {
      success: true,
      message: 'Product retrieved successfully',
      data: { ...product.toObject(), relatedColors },
    };
  }
}
