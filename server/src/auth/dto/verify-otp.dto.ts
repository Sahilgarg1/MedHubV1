import { IsNotEmpty, IsString, Length } from 'class-validator';
import { PhoneDto } from '../../common/dto/base.dto';

export class VerifyOtpDto extends PhoneDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6) // Assuming a 6-digit OTP
  otp: string;
}