import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class CreateBidDto {
  @IsString()
  @IsNotEmpty()
  bidRequestId: string;

  @IsNumber()
  @Min(0) // Discount can be 0%
  @Max(100) // Maximum discount is 100%
  discountPercent: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01) // MRP must be positive and greater than 0
  mrp?: number; // Optional MRP - will fallback to product MRP if not provided

  @IsOptional()
  @IsDateString()
  expiry?: string; // Optional expiry date
}