import { Controller, Post, Body, Headers, Get, Delete, Param } from '@nestjs/common';
import { BidRequestsService } from './bid-requests.service';
import { AutoCancelService } from './auto-cancel.service';
import { CreateBidRequestDto } from './dto/create-bid-request.dto';

@Controller('bid-requests')
export class BidRequestsController {
  constructor(
    private readonly bidRequestsService: BidRequestsService,
    private readonly autoCancelService: AutoCancelService
  ) {}

  // POST /bid-requests (for Retailers to create requests)
  @Post()
  create(
    @Body() createBidRequestDtos: CreateBidRequestDto[],
    @Headers('x-user-id') retailerId: string,
  ) {
    return this.bidRequestsService.createMany(createBidRequestDtos, retailerId);
  }

  // GET /bid-requests (for a specific Retailer to see their own requests)
  @Get()
  findAllForUser(@Headers('x-user-id') retailerId: string) {
    return this.bidRequestsService.findAllForUser(retailerId);
  }

  // GET /bid-requests/active (for Wholesalers to see all active requests - UNFILTERED)
  @Get('active')
  findAllActive() {
    // This shows ALL active requests (for admin/debugging purposes)
    return this.bidRequestsService.findAllActive();
  }

  // GET /bid-requests/active-for-distributor (for Distributors to see only relevant requests)
  @Get('active-for-distributor')
  findAllActiveForDistributor(@Headers('x-user-id') distributorId: string) {
    // This shows only requests for products where this distributor has inventory
    return this.bidRequestsService.findAllActiveForDistributor(distributorId);
  }


  // DELETE /bid-requests/:id (for Retailers to cancel their bid requests)
  @Delete(':id')
  cancel(
    @Param('id') bidRequestId: string,
    @Headers('x-user-id') retailerId: string,
  ) {
    return this.bidRequestsService.cancelBidRequest(bidRequestId, retailerId);
  }

  // POST /bid-requests/test-auto-cancel (for testing auto-cancel functionality)
  @Post('test-auto-cancel')
  testAutoCancel() {
    return this.autoCancelService.triggerAutoCancel();
  }

  // DEBUG: Test distributor filtering
  @Get('debug-distributor/:distributorId')
  debugDistributorFiltering(@Param('distributorId') distributorId: string) {
    return this.bidRequestsService.debugDistributorFiltering(distributorId);
  }

}