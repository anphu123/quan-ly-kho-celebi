import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemDto {
    @ApiProperty({ description: 'Serial Item ID being purchased' })
    @IsString()
    @IsNotEmpty()
    serialItemId: string;

    @ApiProperty({ description: 'Negotiated final purchase price' })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ description: 'Discount applied implicitly or explicitly' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number = 0;
}

export class CheckoutDto {
    @ApiProperty({ description: 'Warehouse ID where the transaction takes place' })
    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @ApiPropertyOptional({ description: 'Customer ID if registered' })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiProperty({ type: [CartItemDto], description: 'Items in the cart' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    items: CartItemDto[];

    @ApiPropertyOptional({ description: 'Payment method: CASH, BANK_TRANSFER, etc.' })
    @IsOptional()
    @IsString()
    paymentMethod?: string = 'CASH';

    @ApiPropertyOptional({ description: 'Amount actually paid by customer' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    paidAmount?: number;

    @ApiPropertyOptional({ description: 'Any notes for the order' })
    @IsOptional()
    @IsString()
    notes?: string;
}
