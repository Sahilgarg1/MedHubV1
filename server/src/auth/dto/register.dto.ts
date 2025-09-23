import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer'; 

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

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsBoolean()
  @IsOptional()
  isWholesaler?: boolean = false;

  @IsString()
  @IsNotEmpty()
  address: string; // Business address (kept separate)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  @IsOptional()
  addresses?: AddressDto[]; // Delivery addresses

  @IsString()
  @IsOptional()
  pickupPoint?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;
}