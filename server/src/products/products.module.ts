import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { EventEmitterService } from '../utils/event-emitter.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, EventEmitterService],
  exports: [ProductsService, EventEmitterService] // Export for use in other modules
})
export class ProductsModule {}
