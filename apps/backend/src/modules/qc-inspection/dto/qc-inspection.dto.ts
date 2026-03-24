import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InspectionStatus, Grade } from '@prisma/client';

// DTO for creating QC inspection item result
export class CreateInspectionItemDto {
  @ApiProperty({ description: 'Check item ID from template' })
  @IsString()
  checkItemId: string;

  @ApiProperty({ description: 'Score given (0 to max score)', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  score: number;

  @ApiProperty({ description: 'Pass/Fail result' })
  @IsBoolean()
  passed: boolean;

  @ApiPropertyOptional({ description: 'Inspector notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO for creating new QC inspection
export class CreateQCInspectionDto {
  @ApiProperty({ description: 'Serial item ID to inspect' })
  @IsString()
  serialItemId: string;

  @ApiProperty({ description: 'QC template ID to use' })
  @IsString()
  templateId: string;

  @ApiPropertyOptional({ description: 'Inspector notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO for updating inspection with results
export class UpdateInspectionResultsDto {
  @ApiProperty({ 
    description: 'Inspection items results',
    type: [CreateInspectionItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInspectionItemDto)
  items: CreateInspectionItemDto[];

  @ApiProperty({ 
    description: 'Total calculated score',
    minimum: 0,
    maximum: 100 
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  totalScore: number;

  @ApiProperty({ 
    description: 'Suggested grade based on score',
    enum: Grade 
  })
  @IsEnum(Grade)
  suggestedGrade: Grade;

  @ApiPropertyOptional({ 
    description: 'Final grade (may differ from suggested)',
    enum: Grade 
  })
  @IsOptional()
  @IsEnum(Grade)
  finalGrade?: Grade;

  @ApiPropertyOptional({ description: 'Final inspector notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO for completing inspection
export class CompleteInspectionDto {
  @ApiProperty({ 
    description: 'Final grade assigned',
    enum: Grade 
  })
  @IsEnum(Grade)
  finalGrade: Grade;

  @ApiPropertyOptional({ description: 'Final completion notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO for inspection query/filters
export class InspectionQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: InspectionStatus })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({ description: 'Filter by inspector ID' })
  @IsOptional()
  @IsString()
  inspectorId?: string;

  @ApiPropertyOptional({ description: 'Filter by serial item ID' })
  @IsOptional()
  @IsString()
  serialItemId?: string;

  @ApiPropertyOptional({ description: 'Start date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Page number',
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
}