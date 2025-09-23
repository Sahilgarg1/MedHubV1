import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ConstantsService {
  constructor(private prisma: PrismaService) {}

  // Support Contacts
  async getSupportContacts(department?: string): Promise<any[]> {
    return this.prisma.supportContact.findMany({
      where: { 
        isActive: true,
        ...(department && { department })
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  async getPrimarySupportContact(): Promise<any | null> {
    return this.prisma.supportContact.findFirst({
      where: { 
        isActive: true,
        isPrimary: true
      }
    });
  }

  async getSupportContactById(id: string): Promise<any | null> {
    return this.prisma.supportContact.findUnique({
      where: { id }
    });
  }

  // Business Configuration
  async getBusinessConfig(category?: string): Promise<any[]> {
    return this.prisma.businessConfig.findMany({
      where: { 
        isActive: true,
        ...(category && { category })
      }
    });
  }

  async getConfigValue(category: string, key: string): Promise<any> {
    const config = await this.prisma.businessConfig.findUnique({
      where: { 
        category_key: { category, key }
      }
    });
    
    if (!config) return null;
    
    // Return the appropriate value based on which field is populated
    if (config.valueInt !== null) return config.valueInt;
    if (config.valueFloat !== null) return config.valueFloat;
    if (config.valueString !== null) return config.valueString;
    if (config.valueBool !== null) return config.valueBool;
    
    return null;
  }

  async getConfigByCategory(category: string): Promise<any[]> {
    return this.prisma.businessConfig.findMany({
      where: { 
        category,
        isActive: true
      }
    });
  }

  // Pickup Points
  async getPickupPoints(): Promise<any[]> {
    return this.prisma.pickupPoint.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async getPickupPointById(id: string): Promise<any | null> {
    return this.prisma.pickupPoint.findUnique({
      where: { id }
    });
  }


  // Validation Rules
  async getValidationRules(fieldType?: string): Promise<any[]> {
    return this.prisma.validationRule.findMany({
      where: { 
        isActive: true,
        ...(fieldType && { fieldType })
      }
    });
  }

  async getValidationRuleByField(fieldType: string, ruleName: string): Promise<any | null> {
    return this.prisma.validationRule.findFirst({
      where: { 
        fieldType,
        ruleName,
        isActive: true
      }
    });
  }

  // Margins
  async getMargins(): Promise<any[]> {
    return this.prisma.margin.findMany({
      orderBy: { class: 'asc' }
    });
  }

  async getMarginByClass(classParam: string): Promise<any | null> {
    return this.prisma.margin.findUnique({
      where: { class: classParam }
    });
  }

  // System Messages
  async getSystemMessages(messageType?: string, language: string = 'en'): Promise<any[]> {
    return this.prisma.systemMessage.findMany({
      where: { 
        isActive: true,
        language,
        ...(messageType && { messageType })
      }
    });
  }

  async getSystemMessage(messageType: string, messageKey: string, language: string = 'en'): Promise<any | null> {
    return this.prisma.systemMessage.findUnique({
      where: { 
        messageType_messageKey_language: { 
          messageType, 
          messageKey, 
          language 
        }
      }
    });
  }

  // Admin methods for updating constants
  async updateSupportContact(id: string, data: Partial<any>): Promise<any> {
    return this.prisma.supportContact.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async updateBusinessConfigInt(id: string, value: number): Promise<any> {
    return this.prisma.businessConfig.update({
      where: { id },
      data: { 
        valueInt: value,
        valueFloat: null,
        valueString: null,
        valueBool: null,
        updatedAt: new Date() 
      }
    });
  }

  async updateBusinessConfigFloat(id: string, value: number): Promise<any> {
    return this.prisma.businessConfig.update({
      where: { id },
      data: { 
        valueFloat: value,
        valueInt: null,
        valueString: null,
        valueBool: null,
        updatedAt: new Date() 
      }
    });
  }

  async updateBusinessConfigString(id: string, value: string): Promise<any> {
    return this.prisma.businessConfig.update({
      where: { id },
      data: { 
        valueString: value,
        valueInt: null,
        valueFloat: null,
        valueBool: null,
        updatedAt: new Date() 
      }
    });
  }

  async updateBusinessConfigBool(id: string, value: boolean): Promise<any> {
    return this.prisma.businessConfig.update({
      where: { id },
      data: { 
        valueBool: value,
        valueInt: null,
        valueFloat: null,
        valueString: null,
        updatedAt: new Date() 
      }
    });
  }

  async updateBusinessConfig(id: string, data: Partial<any>): Promise<any> {
    return this.prisma.businessConfig.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async updatePickupPoint(id: string, data: Partial<any>): Promise<any> {
    return this.prisma.pickupPoint.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async updateValidationRule(id: string, data: Partial<any>): Promise<any> {
    return this.prisma.validationRule.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async updateSystemMessage(id: string, data: Partial<any>): Promise<any> {
    return this.prisma.systemMessage.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }
}

