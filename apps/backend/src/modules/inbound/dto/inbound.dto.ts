import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, IsDecimal, IsBoolean, IsArray, ValidateNested, IsNotEmpty, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InboundStatus, SupplierType } from '@prisma/client';

// ===========================// INBOUND ITEM DTOs (Define first to avoid circular reference)
// ===========================

export class CreateInboundItemDto {
  @ApiPropertyOptional({ description: 'Product template ID if known' })
  @IsOptional()
  @IsString()
  productTemplateId?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Serial number or IMEI' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ description: 'Model name', example: 'iPhone 15 Pro 256GB' })
  @IsString()
  @IsNotEmpty()
  modelName: string;

  @ApiPropertyOptional({ description: 'Item condition', example: 'Tốt' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: 'Estimated value' })
  @IsOptional()
  @IsDecimal()
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Notes about condition' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ===========================// INBOUND REQUEST DTOs
// ===========================

export class CreateInboundRequestDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ enum: SupplierType, description: 'Type of supplier' })
  @IsEnum(SupplierType)
  supplierType: SupplierType;

  @ApiProperty({ description: 'Supplier name' })
  @IsString()
  @MinLength(2)
  supplierName: string;

  @ApiPropertyOptional({ description: 'Supplier phone number' })
  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @ApiPropertyOptional({ description: 'Supplier email' })
  @IsOptional()
  @IsEmail()
  supplierEmail?: string;

  @ApiPropertyOptional({ description: 'Expected receiving date' })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional({ description: 'Total estimated value' })
  @IsOptional()
  @IsDecimal()
  totalEstimatedValue?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInboundItemDto], description: 'Items to receive' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInboundItemDto)
  items: CreateInboundItemDto[];
}

export class UpdateInboundRequestDto {
  @ApiPropertyOptional({ enum: InboundStatus })
  @IsOptional()
  @IsEnum(InboundStatus)
  status?: InboundStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  supplierEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  totalEstimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  totalActualValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// ===========================
// UPDATE DTOs
// ===========================

export class UpdateInboundItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productTemplateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Mark as received' })
  @IsOptional()
  @IsBoolean()
  isReceived?: boolean;
}

// ===========================
// RECEIVING PROCESS DTOs
// ===========================

export class ReceiveItemDto {
  @ApiProperty({ description: 'Inbound item ID' })
  @IsString()
  @IsNotEmpty()
  inboundItemId: string;

  @ApiPropertyOptional({ description: 'Final serial number' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Final condition assessment' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({ description: 'Purchase price' })
  @IsDecimal()
  purchasePrice: number;

  @ApiPropertyOptional({ description: 'Warehouse bin location' })
  @IsOptional()
  @IsString()
  binLocation?: string;

  @ApiPropertyOptional({ description: 'Receiving notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteInboundDto {
  @ApiProperty({ description: 'Inbound request ID' })
  @IsString()
  @IsNotEmpty()
  inboundRequestId: string;

  @ApiProperty({ type: [ReceiveItemDto], description: 'Items being received' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];

  @ApiPropertyOptional({ description: 'Total actual value' })
  @IsOptional()
  @IsDecimal()
  totalActualValue?: number;

  @ApiPropertyOptional({ description: 'Completion notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ===========================  
// QUERY DTOs
// ===========================

export class InboundQueryDto {
  @ApiPropertyOptional({ enum: InboundStatus })
  @IsOptional()
  @IsEnum(InboundStatus)
  status?: InboundStatus;

  @ApiPropertyOptional({ enum: SupplierType })
  @IsOptional()
  @IsEnum(SupplierType)
  supplierType?: SupplierType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string; // Search in supplier name, code, notes

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;
}