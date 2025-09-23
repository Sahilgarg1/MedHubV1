import { Controller, Post, Body, Patch, Headers, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InitiateAuthDto } from './dto/initiate-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto, AddressDto } from './dto/register.dto'; // Import the new DTO
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('initiate')
  initiateAuthentication(@Body() initiateAuthDto: InitiateAuthDto) {
    return this.authService.initiateAuthentication(initiateAuthDto);
  }

  @Post('verify')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  // --- NEW ENDPOINT ---
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Patch('profile')
  updateProfile(
    @Body() updateData: UpdateProfileDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.authService.updateProfile(userId, updateData);
  }

  // Address management endpoints
  @Post('addresses')
  addAddress(
    @Body() addressData: AddressDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.authService.addAddress(userId, addressData);
  }

  @Patch('addresses/:index')
  updateAddress(
    @Param('index') index: string,
    @Body() addressData: AddressDto,
    @Headers('x-user-id') userId: string,
  ) {
    const addressIndex = parseInt(index, 10);
    return this.authService.updateAddress(userId, addressIndex, addressData);
  }

  @Delete('addresses/:index')
  deleteAddress(
    @Param('index') index: string,
    @Headers('x-user-id') userId: string,
  ) {
    const addressIndex = parseInt(index, 10);
    return this.authService.deleteAddress(userId, addressIndex);
  }

  @Patch('addresses/:index/default')
  setDefaultAddress(
    @Param('index') index: string,
    @Headers('x-user-id') userId: string,
  ) {
    const addressIndex = parseInt(index, 10);
    return this.authService.setDefaultAddress(userId, addressIndex);
  }
}