import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiateAuthDto } from './dto/initiate-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto'; // Import the new DTO
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async initiateAuthentication(initiateAuthDto: InitiateAuthDto) {
    // Mock OTP logic
    const otp = '123456';
    console.log(
      `OTP for ${initiateAuthDto.phone} is: ${otp}. (This is a mock OTP)`,
    );
    return { message: 'OTP has been sent successfully.' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    console.log('🔍 OTP Verification Debug:', {
      receivedOtp: verifyOtpDto.otp,
      expectedOtp: '123456',
      phone: verifyOtpDto.phone,
      otpMatch: verifyOtpDto.otp === '123456'
    });
    
    if (verifyOtpDto.otp !== '123456') {
      console.log('❌ OTP Mismatch - returning failure');
      return { success: false, message: 'Invalid OTP.' };
    }
    
    console.log('✅ OTP Match - looking up user in database');
    const user = await this.prisma.user.findUnique({
      where: { phone: verifyOtpDto.phone },
    });
    
    console.log('👤 User lookup result:', { user: user ? 'found' : 'not found' });

    if (user) {
      return {
        success: true,
        isNewUser: false,
        user: user,
      };
    } else {
      return {
        success: true,
        isNewUser: true,
        user: null,
      };
    }
  }

  // --- NEW METHOD ---
  async register(registerDto: RegisterDto) {
    // First, check if a user with this phone number already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone },
    });

    if (existingUser) {
      // This is a safeguard. This endpoint should not be called if a user already exists.
      throw new ConflictException('User with this phone number already exists.');
    }

    // Prepare addresses array - business address becomes first address if not provided
    let addresses = registerDto.addresses || [];
    
    // If no addresses provided, create one from business address
    if (addresses.length === 0) {
      addresses = [{
        contactPerson: 'Business Contact',
        contactNumber: registerDto.contactNumber || registerDto.phone,
        address: registerDto.address,
        city: '',
        state: '',
        pincode: '',
        landmark: '',
      }];
    }

    // Create the new user in the database
    const newUser = await this.prisma.user.create({
      data: {
        ...registerDto,
        addresses: addresses as any, // Cast to any for JSON field
        defaultAddressIndex: 0, // First address is default
      },
    });

    // In a real app, you'd generate a JWT here and return it.
    return {
      message: 'User registered successfully.',
      user: newUser,
      // token: 'generate_jwt_token_here'
    };
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    // Handle addresses field separately for JSON type
    const { addresses, ...otherData } = updateData;
    const dataToUpdate: any = { ...otherData };
    
    if (addresses !== undefined) {
      dataToUpdate.addresses = addresses as any; // Cast to any for JSON field
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return {
      message: 'Profile updated successfully.',
      user: updatedUser,
    };
  }

  // Add a new delivery address
  async addAddress(userId: string, addressData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentAddresses = user.addresses as any[] || [];
    const newAddresses = [...currentAddresses, addressData];

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        addresses: newAddresses as any, // Cast to any for JSON field
      },
    });

    return {
      message: 'Address added successfully.',
      user: updatedUser,
    };
  }

  // Update an existing delivery address
  async updateAddress(userId: string, addressIndex: number, addressData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentAddresses = user.addresses as any[] || [];
    
    if (addressIndex < 0 || addressIndex >= currentAddresses.length) {
      throw new Error('Invalid address index');
    }

    const updatedAddresses = [...currentAddresses];
    updatedAddresses[addressIndex] = addressData;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        addresses: updatedAddresses as any, // Cast to any for JSON field
      },
    });

    return {
      message: 'Address updated successfully.',
      user: updatedUser,
    };
  }

  // Delete a delivery address
  async deleteAddress(userId: string, addressIndex: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentAddresses = user.addresses as any[] || [];
    
    if (addressIndex < 0 || addressIndex >= currentAddresses.length) {
      throw new Error('Invalid address index');
    }

    if (currentAddresses.length <= 1) {
      throw new Error('Cannot delete the last address');
    }

    const updatedAddresses = currentAddresses.filter((_, index) => index !== addressIndex);
    
    // Adjust default address index if necessary
    let newDefaultIndex = user.defaultAddressIndex;
    if (addressIndex === user.defaultAddressIndex) {
      newDefaultIndex = 0; // Set to first address
    } else if (addressIndex < user.defaultAddressIndex) {
      newDefaultIndex = user.defaultAddressIndex - 1;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        addresses: updatedAddresses as any, // Cast to any for JSON field
        defaultAddressIndex: newDefaultIndex,
      },
    });

    return {
      message: 'Address deleted successfully.',
      user: updatedUser,
    };
  }

  // Set default delivery address
  async setDefaultAddress(userId: string, addressIndex: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentAddresses = user.addresses as any[] || [];
    
    if (addressIndex < 0 || addressIndex >= currentAddresses.length) {
      throw new Error('Invalid address index');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        defaultAddressIndex: addressIndex,
      },
    });

    return {
      message: 'Default address updated successfully.',
      user: updatedUser,
    };
  }
}