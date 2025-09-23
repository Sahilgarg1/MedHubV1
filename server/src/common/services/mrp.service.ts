import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MrpValidationResult {
  isValid: boolean;
  mrp: number;
  source: 'provided' | 'product' | 'bid';
  message?: string;
}

@Injectable()
export class MrpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Standardized MRP validation and resolution
   * Priority: provided MRP > product MRP > bid MRP
   */
  async validateAndResolveMrp(
    providedMrp?: number,
    productId?: number,
    bidMrp?: number,
    productName?: string
  ): Promise<MrpValidationResult> {
    // 1. Use provided MRP if valid
    if (providedMrp && providedMrp > 0) {
      return {
        isValid: true,
        mrp: providedMrp,
        source: 'provided',
        message: `Using provided MRP: ₹${providedMrp}`
      };
    }

    // 2. Fallback to product MRP
    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { mrp: true, product_name: true }
      });

      if (product?.mrp && product.mrp > 0) {
        return {
          isValid: true,
          mrp: product.mrp,
          source: 'product',
          message: `Using product MRP: ₹${product.mrp}`
        };
      }
    }

    // 3. Fallback to bid MRP
    if (bidMrp && bidMrp > 0) {
      return {
        isValid: true,
        mrp: bidMrp,
        source: 'bid',
        message: `Using bid MRP: ₹${bidMrp}`
      };
    }

    // 4. No valid MRP found
    const productDisplayName = productName || 'this product';
    return {
      isValid: false,
      mrp: 0,
      source: 'provided',
      message: `MRP is required for ${productDisplayName}. Please provide MRP or ensure the product has MRP set in inventory.`
    };
  }

  /**
   * Update product MRP if the new MRP is higher
   * This maintains the "highest MRP wins" policy
   */
  async updateProductMrpIfHigher(productId: number, newMrp: number): Promise<boolean> {
    if (!newMrp || newMrp <= 0) {
      return false;
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { mrp: true, product_name: true }
    });

    if (!product) {
      throw new BadRequestException(`Product with ID ${productId} not found`);
    }

    const currentMrp = product.mrp || 0;
    
    // Only update if the new MRP is higher
    if (newMrp > currentMrp) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { mrp: newMrp }
      });
      
      console.log(`📈 Updated MRP for "${product.product_name}": ₹${currentMrp} → ₹${newMrp}`);
      return true;
    }

    return false;
  }

  /**
   * Get the best available MRP for a product
   * Priority: product MRP > bid MRP
   */
  async getBestAvailableMrp(productId: number, bidMrp?: number): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { mrp: true }
    });

    const productMrp = product?.mrp || 0;
    const fallbackMrp = bidMrp || 0;

    // Return the higher of the two, or the first available one
    if (productMrp > 0 && fallbackMrp > 0) {
      return Math.max(productMrp, fallbackMrp);
    } else if (productMrp > 0) {
      return productMrp;
    } else if (fallbackMrp > 0) {
      return fallbackMrp;
    }

    return 0;
  }

  /**
   * Validate MRP value
   */
  validateMrpValue(mrp: number, fieldName: string = 'MRP'): void {
    if (!mrp || mrp <= 0) {
      throw new BadRequestException(`${fieldName} must be greater than 0`);
    }

    if (mrp > 1000000) {
      throw new BadRequestException(`${fieldName} cannot exceed ₹10,00,000`);
    }
  }
}
