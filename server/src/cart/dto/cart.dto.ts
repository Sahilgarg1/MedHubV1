import { IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NumericIdDto, QuantityDto } from '../../common/dto/base.dto';

export class AddToCartDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveFromCartDto {
  @IsInt()
  productId: number;
}

export class SyncCartItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items: SyncCartItemDto[];
}

// Alternative DTO for direct array format (what client actually sends)
export class SyncCartArrayDto extends Array<SyncCartItemDto> {
  constructor(...items: SyncCartItemDto[]) {
    super(...items);
  }
}
