import { IsString, IsNotEmpty, IsOptional, Length, IsNumber, Min, Max, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Common DTO base classes
export abstract class BaseDto {
  // Common validation patterns can be added here
}

// Phone number validation DTO
export class PhoneDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  phone: string;
}

// Common ID validation DTO
export class IdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

// Common numeric ID validation DTO
export class NumericIdDto {
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('ID must be a valid number');
    }
    return parsed;
  })
  @Type(() => Number)
  @IsNumber()
  id: number;
}

// Common quantity validation DTO
export class QuantityDto {
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

// Common discount validation DTO
export class DiscountDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;
}

// Common MRP validation DTO
export class MrpDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  mrp?: number;
}

// Address DTO for delivery addresses
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  contactPerson: string; // Contact person name

  @IsString()
  @IsNotEmpty()
  contactNumber: string; // Contact number for this address

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  landmark?: string;
}

// Common business profile fields
export class BusinessProfileDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  address?: string; // Business address (kept separate)

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[]; // Delivery addresses

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultAddressIndex?: number; // Index of default address

  @IsOptional()
  @IsString()
  pickupPoint?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;
}

// User role validation
export class UserRoleDto {
  @IsBoolean()
  @IsNotEmpty()
  isWholesaler: boolean;
}

// Common pagination DTO
export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Common search/filter DTO
export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
