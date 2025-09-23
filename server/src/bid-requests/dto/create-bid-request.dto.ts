import { IsNotEmpty, Min, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBidRequestDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('productId must be a valid number');
    }
    return parsed;
  })
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('quantity must be a valid number');
    }
    return parsed;
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}