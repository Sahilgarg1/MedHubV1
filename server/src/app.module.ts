import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { BidRequestsModule } from './bid-requests/bid-requests.module';
import { OrdersModule } from './orders/orders.module';
import { BidsModule } from './bids/bids.module';
import { CartModule } from './cart/cart.module';
import { ConstantsModule } from './constants/constants.module';
import { SupportContactsModule } from './support-contacts';
import { HealthModule } from './health/health.module';
import { UploadProgressGateway } from './gateways/upload-progress.gateway';
import { EventEmitterService } from './utils/event-emitter.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    PrismaModule, 
    CommonModule,
    AuthModule, 
    ProductsModule, 
    BidRequestsModule, 
    OrdersModule, 
    BidsModule, 
    CartModule,
    ConstantsModule,
    SupportContactsModule,
    HealthModule
  ],
  providers: [UploadProgressGateway, EventEmitterService],
})
export class AppModule {}