import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(
    @Body() createBidDto: CreateBidDto,
    @Headers('x-user-id') wholesalerId: string, // Temporary mock auth
  ) {
    return this.bidsService.create(createBidDto, wholesalerId);
  }
    @Get()
  findAll(@Headers('x-user-id') wholesalerId: string) { // Mock Auth
    return this.bidsService.findAllForWholesaler(wholesalerId);
  }

  // REMOVED: Bid cancellation endpoint for distributors
  // According to business requirements, distributors cannot cancel their bids

}