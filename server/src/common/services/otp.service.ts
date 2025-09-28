import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface OtpData {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private otpStorage = new Map<string, OtpData>();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor(private prisma: PrismaService) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOTP(phone: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    
    const otpData: OtpData = {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    };

    // Store in memory (in production, consider using Redis)
    this.otpStorage.set(phone, otpData);

    // Also store in database for persistence
    await this.prisma.otpSession.upsert({
      where: { phone },
      update: {
        otp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        phone,
        otp,
        expiresAt,
        attempts: 0,
      },
    });

    return otp;
  }

  async verifyOTP(phone: string, inputOtp: string): Promise<{ valid: boolean; message: string }> {
    // Check memory first
    let otpData = this.otpStorage.get(phone);
    
    // If not in memory, check database
    if (!otpData) {
      const dbOtp = await this.prisma.otpSession.findUnique({
        where: { phone },
      });
      
      if (!dbOtp) {
        return { valid: false, message: 'No OTP found for this phone number' };
      }
      
      otpData = {
        phone: dbOtp.phone,
        otp: dbOtp.otp,
        expiresAt: dbOtp.expiresAt,
        attempts: dbOtp.attempts,
      };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.cleanupOTP(phone);
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.cleanupOTP(phone);
      return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
    }

    // Increment attempts
    otpData.attempts++;
    this.otpStorage.set(phone, otpData);
    
    await this.prisma.otpSession.update({
      where: { phone },
      data: { attempts: otpData.attempts },
    });

    // Verify OTP
    if (otpData.otp !== inputOtp) {
      return { valid: false, message: 'Invalid OTP. Please try again.' };
    }

    // OTP is valid, clean up
    this.cleanupOTP(phone);
    return { valid: true, message: 'OTP verified successfully' };
  }

  private async cleanupOTP(phone: string): Promise<void> {
    this.otpStorage.delete(phone);
    await this.prisma.otpSession.deleteMany({
      where: { phone },
    });
  }

  async isOTPValid(phone: string): Promise<boolean> {
    const otpData = this.otpStorage.get(phone);
    if (!otpData) return false;
    
    return new Date() <= otpData.expiresAt && otpData.attempts < this.MAX_ATTEMPTS;
  }

  // Clean up expired OTPs periodically
  async cleanupExpiredOTPs(): Promise<void> {
    const now = new Date();
    
    // Clean memory
    for (const [phone, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(phone);
      }
    }
    
    // Clean database
    await this.prisma.otpSession.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
