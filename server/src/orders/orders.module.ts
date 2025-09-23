import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { EventEmitterService } from '../utils/event-emitter.service';
import { MrpService } from '../common/services/mrp.service';

@Module({
  imports: [],
  controllers: [OrdersController],
  providers: [OrdersService, EventEmitterService, MrpService]
})
export class OrdersModule {}
