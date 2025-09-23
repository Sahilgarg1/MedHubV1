import { Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { EventEmitterService } from '../utils/event-emitter.service';
import { MrpService } from '../common/services/mrp.service';

@Module({
  imports: [],
  controllers: [BidsController],
  providers: [BidsService, EventEmitterService, MrpService]
})
export class BidsModule {}
