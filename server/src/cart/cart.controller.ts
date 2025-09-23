import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, SyncCartDto, SyncCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Headers('x-user-id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post()
  async addToCart(@Headers('x-user-id') userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Put(':productId')
  async updateCartItem(
    @Headers('x-user-id') userId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, parseInt(productId), updateCartItemDto);
  }

  @Delete(':productId')
  async removeFromCart(@Headers('x-user-id') userId: string, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(userId, parseInt(productId));
  }

  @Delete()
  async clearCart(@Headers('x-user-id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Post('sync')
  async syncCart(@Headers('x-user-id') userId: string, @Body() body: SyncCartItemDto[] | { items: SyncCartItemDto[] }) {
    try {
      console.log('Sync cart request body:', body);
      console.log('Sync cart request userId:', userId);
      
      // Handle both array format (what client sends) and object format
      let cartItems: SyncCartItemDto[] = [];
      if (Array.isArray(body)) {
        cartItems = body;
      } else if (body && body.items && Array.isArray(body.items)) {
        cartItems = body.items;
      } else {
        cartItems = [];
      }
      
      console.log('Processed cart items:', cartItems);
      
      const result = await this.cartService.syncCart(userId, cartItems);
      console.log('Sync cart result:', result);
      return result;
    } catch (error) {
      console.error('Sync cart error:', error);
      throw error;
    }
  }

  @Post('test')
  async testEndpoint(@Headers('x-user-id') userId: string, @Body() body: any) {
    console.log('Test endpoint called with:', { userId, body });
    return { message: 'Test endpoint working', userId, body };
  }

  @Post('sync-simple')
  async syncCartSimple(@Headers('x-user-id') userId: string, @Body() body: any) {
    console.log('Simple sync endpoint called with:', { userId, body });
    try {
      // Just return success for now
      return { message: 'Simple sync working', userId, body };
    } catch (error) {
      console.error('Simple sync error:', error);
      throw error;
    }
  }
}
