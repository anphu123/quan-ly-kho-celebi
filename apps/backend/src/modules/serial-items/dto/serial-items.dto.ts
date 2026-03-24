import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsDateString,
  Min,
  Max,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SerialStatus, Grade } from '@prisma/client';

export class CreateSerialItemDto {
  @ApiProperty({ description: 'Product template ID' })
  @IsString()
  productTemplateId: string;

  @ApiProperty({ description: 'Warehouse ID where item is stored' })
  @IsString()
  warehouseId: string;

  @ApiPropertyOptional({ description: 'Serial number or IMEI' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Internal barcode (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  internalCode?: string;

  @ApiProperty({ description: 'Purchase price in VND' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  purchasePrice: number;

  @ApiPropertyOptional({ description: 'Purchase date' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Source of acquisition' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Purchase batch code' })
  @IsOptional()
  @IsString()
  purchaseBatch?: string;

  @ApiPropertyOptional({ description: 'Bin location in warehouse' })
  @IsOptional()
  @IsString()
  binLocation?: string;

  @ApiPropertyOptional({ description: 'Initial condition notes' })
  @IsOptional()
  @IsString()
  conditionNotes?: string;
}

export class UpdateSerialItemDto {
  @ApiPropertyOptional({ description: 'Serial number or IMEI' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Internal barcode' })
  @IsOptional()
  @IsString()
  internalCode?: string;

  @ApiPropertyOptional({ description: 'Purchase price in VND' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Current cost price (including repairs)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  currentCostPrice?: number;

  @ApiPropertyOptional({ description: 'Suggested selling price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  suggestedPrice?: number;

  @ApiPropertyOptional({ description: 'Purchase date' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Source of acquisition' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Purchase batch code' })
  @IsOptional()
  @IsString()
  purchaseBatch?: string;

  @ApiPropertyOptional({ 
    description: 'Current status',
    enum: SerialStatus 
  })
  @IsOptional()
  @IsEnum(SerialStatus)
  status?: SerialStatus;

  @ApiPropertyOptional({ 
    description: 'Quality grade',
    enum: Grade 
  })
  @IsOptional()
  @IsEnum(Grade)
  grade?: Grade;

  @ApiPropertyOptional({ description: 'Condition notes' })
  @IsOptional()
  @IsString()
  conditionNotes?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Bin location in warehouse' })
  @IsOptional()
  @IsString()
  binLocation?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SerialItemsQueryDto {
  @ApiPropertyOptional({ 
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20 
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: SerialStatus 
  })
  @IsOptional()
  @IsEnum(SerialStatus)
  status?: SerialStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by grade',
    enum: Grade 
  })
  @IsOptional()
  @IsEnum(Grade)
  grade?: Grade;

  @ApiPropertyOptional({ description: 'Filter by product template ID' })
  @IsOptional()
  @IsString()
  productTemplateId?: string;

  @ApiPropertyOptional({ description: 'Filter by warehouse ID' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ 
    description: 'Search by serial number, internal code, or product name' 
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateSpecsDto {
  @ApiProperty({ description: 'Attribute ID' })
  @IsString()
  attributeId: string;

  @ApiProperty({ description: 'Specification value (flexible JSON)' })
  value: any;
}

export class SerialItemStatsDto {
  @ApiProperty({ description: 'Total number of items' })
  totalItems: number;

  @ApiProperty({ description: 'Count by status' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Count by grade' })
  byGrade: Record<string, number>;

  @ApiProperty({ description: 'Total inventory cost value' })
  totalCostValue: number;

  @ApiProperty({ description: 'Total suggested selling value' })
  totalSuggestedValue: number;

  @ApiProperty({ description: 'Average cost price' })
  averageCostPrice: number;

  @ApiProperty({ description: 'Average suggested price' })
  averageSuggestedPrice: number;
}