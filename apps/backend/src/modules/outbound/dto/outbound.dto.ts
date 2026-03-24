import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OutboundItemDto {
    @ApiProperty({ description: 'Serial Item ID being outbound' })
    @IsString()
    @IsNotEmpty()
    serialItemId: string;

    @ApiPropertyOptional({ description: 'Specific notes for this item' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateOutboundDto {
    @ApiProperty({ description: 'Warehouse ID where the items are leaving from' })
    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @ApiProperty({ description: 'Type of outbound: RETURN_TO_VENDOR, DISPOSAL, INTERNAL_TRANSFER' })
    @IsString()
    @IsNotEmpty()
    type: 'RETURN_TO_VENDOR' | 'DISPOSAL' | 'INTERNAL_TRANSFER';

    @ApiPropertyOptional({ description: 'Destination ID (if internal transfer) or Supplier ID (if return)' })
    @IsOptional()
    @IsString()
    destinationId?: string;

    @ApiProperty({ type: [OutboundItemDto], description: 'Items being outbound' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OutboundItemDto)
    items: OutboundItemDto[];

    @ApiPropertyOptional({ description: 'General notes for this outbound request' })
    @IsOptional()
    @IsString()
    notes?: string;
}
