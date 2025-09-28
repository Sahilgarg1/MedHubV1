import { Injectable, Logger } from '@nestjs/common';
import { Vonage } from '@vonage/server-sdk';
import { SMS } from '@vonage/messages';
// import { AppConfigService } from './app-config.service'; // Assuming you have this service

@Injectable()
export class SnsService {
  private readonly logger = new Logger(SnsService.name);
  private vonage: Vonage;

  constructor() {
    // It's highly recommended to store credentials in a secure config service or environment variables
    // instead of hardcoding them.
    this.vonage = new Vonage({
      apiKey: '08a390c1', // From your curl command
      apiSecret: 'LUM^XvcA3)w', // Replace with your actual secret
    });
  }

  /**
   * Sends an SMS using the Vonage API.
   * @param to The recipient's phone number in E.164 format (e.g., 919781962467).
   * @param text The text message to send.
   * @param from The sender ID (e.g., "Vonage APIs"). This can be a name or a number.
   * @returns A boolean indicating whether the message was sent successfully.
   */
  async sendSMS(to: string, text: string, from: string = 'MedTrade'): Promise<boolean> {
    await this.vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); return true;})
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); return false;});

        return true;
  }

  // Optional: A helper function to format phone numbers if needed, though Vonage is flexible

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your TradeMed verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    return this.sendSMS(phoneNumber, message,"Medtrade");
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, remove it
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    
    // If it doesn't start with country code, add +91 for India
    if (withoutLeadingZero.length === 10) {
      return `+91${withoutLeadingZero}`;
    }
    
    // If it already has country code, add + prefix
    if (withoutLeadingZero.length > 10) {
      return `+${withoutLeadingZero}`;
    }
    
    // Default to adding +91 for India
    return `+91${withoutLeadingZero}`;
  }
}
