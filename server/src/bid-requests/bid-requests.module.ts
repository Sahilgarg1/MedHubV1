import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BidRequestsController } from './bid-requests.controller';
import { BidRequestsService } from './bid-requests.service';
import { AutoCancelService } from './auto-cancel.service';
import { EventEmitterService } from '../utils/event-emitter.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BidRequestsController],
  providers: [BidRequestsService, AutoCancelService, EventEmitterService]
})
export class BidRequestsModule {}
