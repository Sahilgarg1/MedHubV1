import { Controller, Get, Post, Body, Headers } from '@nestjs/common'; // Add Post & Body
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto'; // Import DTO

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // This endpoint already exists
  @Get()
  findAll(
    @Headers('x-user-id') userId: string, 
    @Headers('x-user-is-wholesaler') isWholesaler: string
  ) {
    const mockUser = { id: userId, isWholesaler: isWholesaler === 'true' };
    return this.ordersService.findAllForUser(mockUser as any);
  }

  // --- ADD THIS NEW ENDPOINT ---
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('x-user-id') retailerId: string, // Mock auth
  ) {
    return this.ordersService.createFromBid(
      createOrderDto.bidId, 
      retailerId, 
      createOrderDto.pickupPoint
    );
  }
}