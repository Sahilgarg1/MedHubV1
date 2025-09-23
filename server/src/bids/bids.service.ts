import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { EventEmitterService } from '../utils/event-emitter.service';
import { MrpService } from '../common/services/mrp.service';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
    private mrpService: MrpService,
  ) {}

  /* Convert string ID to integer for distributors array */
  private stringToInt(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async create(createBidDto: CreateBidDto, wholesalerId: string) {
    // First, get the bid request with inventory info to calculate final price
    const bidRequest = await this.prisma.bidRequest.findUnique({
      where: { id: createBidDto.bidRequestId },
      include: { product: true },
    });

    if (!bidRequest) {
      throw new NotFoundException('Bid request not found');
    }


    // Use standardized MRP validation and resolution
    const mrpResult = await this.mrpService.validateAndResolveMrp(
      createBidDto.mrp,
      bidRequest.productId,
      undefined,
      bidRequest.product.product_name
    );

    if (!mrpResult.isValid) {
      throw new BadRequestException(mrpResult.message);
    }

    const mrp = mrpResult.mrp;

    // Check if this wholesaler already has a bid for this request
    const existingBidFromSameWholesaler = await this.prisma.bid.findFirst({
      where: {
        bidRequestId: createBidDto.bidRequestId,
        wholesalerId: wholesalerId,
        status: 'PENDING', // Only consider active pending bids
      },
    });

    // Check for existing bids from OTHER wholesalers to enforce minimum discount
    const existingBidsFromOthers = await this.prisma.bid.findMany({
      where: {
        bidRequestId: createBidDto.bidRequestId,
        status: 'PENDING', // Only consider active pending bids
        wholesalerId: { not: wholesalerId }, // Exclude bids from the same wholesaler
      },
      orderBy: {
        discountPercent: 'desc', // Highest discount first
      },
      take: 1, // Get the best existing bid from others
    });

    // If there are bids from other wholesalers, new bid must offer higher discount
    if (existingBidsFromOthers.length > 0) {
      const bestExistingDiscount = existingBidsFromOthers[0].discountPercent;
      if (createBidDto.discountPercent <= bestExistingDiscount) {
        throw new BadRequestException(`Your discount must be higher than the current best offer of ${bestExistingDiscount.toFixed(1)}%. Please offer at least ${(bestExistingDiscount + 0.1).toFixed(1)}% discount.`);
      }
    }

    // Calculate final price from discount percentage using the determined MRP
    const finalPrice = mrp * (1 - createBidDto.discountPercent / 100);

    let resultBid;

    if (existingBidFromSameWholesaler) {
      // Replace the existing bid from the same wholesaler
      resultBid = await this.prisma.bid.update({
        where: { id: existingBidFromSameWholesaler.id },
        data: {
          discountPercent: createBidDto.discountPercent,
          finalPrice: finalPrice,
          mrp: createBidDto.mrp || bidRequest.product.mrp || 0,
          expiry: createBidDto.expiry ? new Date(createBidDto.expiry) : null,
          updatedAt: new Date(), // Explicitly update the timestamp
        },
      });
    } else {
      // Create a new bid
      resultBid = await this.prisma.bid.create({
        data: {
          discountPercent: createBidDto.discountPercent,
          finalPrice: finalPrice,
          mrp: createBidDto.mrp || bidRequest.product.mrp || 0,
          expiry: createBidDto.expiry ? new Date(createBidDto.expiry) : null,
          bidRequestId: createBidDto.bidRequestId,
          wholesalerId: wholesalerId,
        },
      });
    }

    // 💰 MRP UPDATE LOGIC: Update Product table MRP if wholesaler provided a higher MRP
    if (createBidDto.mrp && createBidDto.mrp > 0) {
      await this.mrpService.updateProductMrpIfHigher(bidRequest.productId, createBidDto.mrp);
    }

    // 🕒 AUTO-CANCEL LOGIC: Update updatedAt timestamp for auto-cancel functionality
    // Note: Once lastBidReceivedAt field is added to database, this will be updated
    await this.prisma.bidRequest.update({
      where: { id: createBidDto.bidRequestId },
      data: { 
        updatedAt: new Date()
      }
    });

    // Emit WebSocket event for real-time updates
    this.eventEmitter.emitBidCreated({
      bidId: resultBid.id,
      bidRequestId: createBidDto.bidRequestId,
      wholesalerId: wholesalerId,
      retailerId: bidRequest.retailerId,
      productId: bidRequest.productId,
      discountPercent: resultBid.discountPercent,
      finalPrice: resultBid.finalPrice,
      mrp: resultBid.mrp,
      status: resultBid.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
      createdAt: resultBid.createdAt,
      updatedAt: resultBid.updatedAt,
    });

    return resultBid;
  }

  // --- THIS IS THE CORRECTED METHOD ---
  async findAllForWholesaler(wholesalerId: string) {
    const bids = await this.prisma.bid.findMany({
      where: {
        wholesalerId: wholesalerId,
        // Include all bids (pending, accepted, rejected/cancelled) for submitted bids list
      },
      include: {
        bidRequest: {
          include: {
            product: true,
            retailer: {
              select: { businessName: true },
            },
            bids: {
              select: {
                discountPercent: true,
                wholesalerId: true,
                status: true,
              },
              orderBy: {
                discountPercent: 'desc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add information about whether each bid is still the best bid and if cancellation is allowed
    return bids.map(bid => {
      const allBids = bid.bidRequest.bids;
      // Filter out cancelled bids when determining current bid
      const activeBids = allBids.filter(b => b.status === 'PENDING');
      const currentBid = activeBids[0]; // Highest discount active bid
      const isCurrentBid = currentBid && currentBid.wholesalerId === wholesalerId;
      
      // Check if this wholesaler has already cancelled a bid on this bid request
      const hasCancelledBefore = allBids.some(b => 
        b.wholesalerId === wholesalerId && b.status === 'REJECTED'
      );
      
      return {
        ...bid,
        isCurrentBid,
        canCancel: !hasCancelledBefore && bid.status === 'PENDING',
      };
    });
  }

  // REMOVED: Bid cancellation functionality for distributors
  // According to business requirements, distributors cannot cancel their bids
  // This ensures bid integrity and prevents gaming the system
}