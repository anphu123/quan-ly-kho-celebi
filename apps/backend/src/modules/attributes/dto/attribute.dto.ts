import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType } from '@prisma/client';

export class CreateAttributeGroupDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    sortOrder?: number;
}

export class CreateAttributeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    attributeGroupId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    key: string; // e.g., "battery_health"

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "Tình trạng Pin (%)"

    @ApiProperty({ enum: AttributeType })
    @IsEnum(AttributeType)
    type: AttributeType;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    sortOrder?: number;

    @ApiPropertyOptional()
    @IsOptional()
    options?: any; // JSON for SELECT/MULTISELECT options

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    minValue?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    maxValue?: number;
}
