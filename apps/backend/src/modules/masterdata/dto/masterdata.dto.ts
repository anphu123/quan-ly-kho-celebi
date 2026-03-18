import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProductType, TrackingMethod } from '@prisma/client';

// ===========================
// CATEGORY DTOs
// ===========================

export class CreateCategoryDto {
  @ApiProperty({ example: 'Smartphone' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PHONE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: ProductType, example: 'ELECTRONICS' })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiPropertyOptional({ enum: TrackingMethod, example: 'SERIAL_BASED' })
  @IsEnum(TrackingMethod)
  @IsOptional()
  trackingMethod?: TrackingMethod;

  @ApiPropertyOptional({ example: 'Điện thoại thông minh' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'parent-category-id' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ type: [String], example: ['brand-id-1', 'brand-id-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandIds?: string[];
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;

  @ApiPropertyOptional({ enum: TrackingMethod })
  @IsEnum(TrackingMethod)
  @IsOptional()
  trackingMethod?: TrackingMethod;

  @ApiPropertyOptional({ example: 'brand-id' })
  @IsString()
  @IsOptional()
  brandId?: string;
}

// ===========================
// BRAND DTOs
// ===========================

export class CreateBrandDto {
  @ApiProperty({ example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'APPLE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ type: [String], example: ['category-id-1', 'category-id-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class BrandQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'category-id' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

// ===========================
// PRODUCT TEMPLATE DTOs
// ===========================

export class CreateProductTemplateDto {
  @ApiProperty({ example: 'IP15PM-256-NT' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max 256GB Natural Titanium' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'A3108' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 'Flagship smartphone from Apple' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'category-id' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'brand-id' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ example: 28000000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  baseWholesalePrice?: number;

  @ApiPropertyOptional({ example: 32000000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  baseRetailPrice?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductTemplateDto extends PartialType(CreateProductTemplateDto) {}

export class ProductTemplateQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
