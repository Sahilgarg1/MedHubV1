import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto, SyncCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already exists in cart
    const existingCartItem = await this.prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: productId,
        },
      },
    });

    if (existingCartItem) {
      // Update existing item
      return this.prisma.cart.update({
        where: {
          userId_productId: {
            userId,
            productId: productId,
          },
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: true,
        },
      });
    } else {
      // Create new cart item
      return this.prisma.cart.create({
        data: {
          userId,
          productId: productId,
          quantity,
        },
        include: {
          product: true,
        },
      });
    }
  }

  async updateCartItem(userId: string, productId: number, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    return this.prisma.cart.update({
      where: {
        userId_productId: {
          userId,
          productId: productId,
        },
      },
      data: { quantity },
      include: {
        product: true,
      },
    });
  }

  async removeFromCart(userId: string, productId: number) {
    return this.prisma.cart.delete({
      where: {
        userId_productId: {
          userId,
          productId: productId,
        },
      },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cart.deleteMany({
      where: { userId },
    });
  }

  async syncCart(userId: string, cartItems: any[]) {
    try {
      console.log('Cart service syncCart called with:', { userId, cartItems });
      
      // Validate userId
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // If no items, just clear the cart
      if (!cartItems || cartItems.length === 0) {
        console.log('No cart items provided, clearing cart for user:', userId);
        await this.clearCart(userId);
        return { count: 0, message: 'Cart cleared' };
      }

      // Validate that the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      
      if (!user) {
        console.log('User not found:', userId);
        throw new Error(`User not found: ${userId}`);
      }

      // Validate cart items structure (only if items exist)
      if (cartItems.length > 0) {
        for (const item of cartItems) {
          if (!item.productId || !item.quantity) {
            throw new Error('Invalid cart item: missing productId or quantity');
          }
          if (typeof item.productId !== 'number' || typeof item.quantity !== 'number') {
            throw new Error('Invalid cart item: productId and quantity must be numbers');
          }
          if (item.quantity <= 0) {
            throw new Error('Invalid cart item: quantity must be greater than 0');
          }
        }
      }

      // Validate that all products exist first (only if items exist)
      if (cartItems.length > 0) {
        const productIds = cartItems.map(item => item.productId);
        const existingProducts = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true },
        });
        
        const existingProductIds = existingProducts.map(p => p.id);
        const invalidProductIds = productIds.filter(id => !existingProductIds.includes(id));
        
        if (invalidProductIds.length > 0) {
          console.log('Invalid product IDs found:', invalidProductIds);
          throw new Error(`Products not found: ${invalidProductIds.join(', ')}`);
        }
      }

      // Use a transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Clear existing cart
        console.log('Clearing existing cart for user:', userId);
        await tx.cart.deleteMany({
          where: { userId },
        });

        // Add all items from the provided cart (only if items exist)
        if (cartItems.length > 0) {
          const upsertPromises = cartItems.map(item => 
            tx.cart.upsert({
              where: {
                userId_productId: {
                  userId,
                  productId: item.productId,
                },
              },
              update: {
                quantity: item.quantity,
              },
              create: {
                userId,
                productId: item.productId,
                quantity: item.quantity,
              },
            })
          );

          const results = await Promise.all(upsertPromises);
          console.log('Cart synced successfully:', results.length, 'items');
          return { count: results.length };
        } else {
          console.log('Cart cleared successfully (no items to add)');
          return { count: 0 };
        }
      });

      return result;
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  }
}
