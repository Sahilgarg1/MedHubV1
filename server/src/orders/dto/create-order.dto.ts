import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  bidId: string; // The ID of the winning bid

  @IsString()
  @IsOptional()
  pickupPoint?: string; // Optional pickup point for the order

  @IsNumber()
  @IsOptional()
  retailerDiscount?: number; // Margin-adjusted discount from retailer UI

  @IsNumber()
  @IsOptional()
  retailerPrice?: number; // Margin-adjusted price from retailer UI
}