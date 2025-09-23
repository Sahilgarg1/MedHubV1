import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { calculateRetailerDiscount, calculateRetailerPrice } from '../utils/discountUtils';
import { EventEmitterService } from '../utils/event-emitter.service';
import { MrpService } from '../common/services/mrp.service';

// This is a temporary placeholder for a real authenticated user object
interface AuthenticatedUser {
  id: string;
  isWholesaler: boolean;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
    private mrpService: MrpService,
  ) {}

  // This method already exists
  async findAllForUser(user: AuthenticatedUser) {
    if (!user) {
      throw new UnauthorizedException();
    }
    
    if (!user.isWholesaler) {
      // For retailers, return individual orders
      return this.prisma.order.findMany({
        where: { retailerId: user.id },
        include: {
          product: true,
          bid: true, // Include bid relation to access discount information
          retailer: { select: { businessName: true } },
          bucket: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // For wholesalers, return order buckets
      return this.prisma.orderBucket.findMany({
        where: { wholesalerId: user.id },
        include: {
          retailer: {
            select: {
              id: true,
              businessName: true,
              gstNumber: true,
            },
          },
          wholesaler: {
            select: {
              id: true,
              contactNumber: true,
            },
          },
          orders: {
            include: {
              product: true,
              bid: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  // --- ADD THIS NEW METHOD ---
  async createFromBid(
    bidId: string, 
    retailerId: string, 
    pickupPoint?: string
  ) {
    
    // First, execute the transaction for database operations
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Find the winning bid and all its related info
      const winningBid = await tx.bid.findUnique({
        where: { id: bidId },
        include: { bidRequest: { include: { product: true } } },
      });

      
      if (!winningBid) {
        throw new NotFoundException('Bid not found.');
      }
      
      if (winningBid.bidRequest.retailerId !== retailerId) {
        throw new NotFoundException('You do not own this request.');
      }

      const bidRequest = await tx.bidRequest.findUnique({
        where: { id: winningBid.bidRequestId },
        include: { product: true },
      });

      if (!bidRequest) {
        throw new NotFoundException('Bid request not found.');
      }

      // 2. Store the original bid values (not margin-adjusted) in the order
      // The margin adjustment is only for display purposes in the retailer view
      const orderMrp = winningBid.mrp; // Use the actual MRP from the accepted bid
      const orderDiscountPercent = winningBid.discountPercent; // Use the actual discount from the accepted bid
      
      // Debug logging
      console.log('🔍 [ORDER DEBUG] Creating order from bid:', {
        bidId: winningBid.id,
        orderMrp,
        orderDiscountPercent,
        quantity: bidRequest.quantity,
        productName: bidRequest.product.product_name
      });
      
      // Calculate the final price using the original bid values
      const finalPrice = orderMrp * (1 - orderDiscountPercent / 100);
      
      console.log('🔍 [ORDER DEBUG] Price calculation:', {
        finalPrice,
        orderPrice: bidRequest.quantity * finalPrice
      });
      
      // 4. Find or create an order bucket for this retailer-wholesaler pair within the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      let bucket = await tx.orderBucket.findFirst({
        where: {
          retailerId: retailerId,
          wholesalerId: winningBid.wholesalerId,
          createdAt: { gte: oneHourAgo },
          status: 'PENDING_FULFILLMENT',
        },
        orderBy: { createdAt: 'desc' },
      });

      // If no bucket exists, create a new one
      if (!bucket) {
        bucket = await tx.orderBucket.create({
          data: {
            retailerId: retailerId,
            wholesalerId: winningBid.wholesalerId,
            totalPrice: 0,
            totalItems: 0,
            status: 'PENDING_FULFILLMENT',
          },
        });
      }

      // 5. Create the Order and associate it with the bucket
      const orderPrice = bidRequest.quantity * finalPrice;
      const newOrder = await tx.order.create({
        data: {
          quantity: bidRequest.quantity,
          totalPrice: orderPrice, // Use the actual price from the accepted bid
          discountPercent: orderDiscountPercent, // Store the actual discount from the accepted bid
          mrp: orderMrp, // Store the actual MRP from the accepted bid
          retailerId: retailerId,
          wholesalerId: winningBid.wholesalerId,
          productId: bidRequest.productId,
          bidId: winningBid.id,
          pickupPoint: pickupPoint,
          bucketId: bucket.id,
        },
      });

      // 5. Update the bucket totals
      await tx.orderBucket.update({
        where: { id: bucket.id },
        data: {
          totalPrice: { increment: orderPrice },
          totalItems: { increment: bidRequest.quantity },
        },
      });

      // 6. Deactivate the parent Bid Request
      await tx.bidRequest.update({
        where: { id: bidRequest.id },
        data: { status: 'INACTIVE' },
      });

      // 7. Mark the winning bid as ACCEPTED
      await tx.bid.update({
        where: { id: winningBid.id },
        data: { status: 'ACCEPTED' },
      });

      // 8. Reject all other bids for this request
      await tx.bid.updateMany({
        where: {
          bidRequestId: bidRequest.id,
          id: { not: winningBid.id },
        },
        data: { status: 'REJECTED' },
      });

      // Return data needed for notifications
      return {
        newOrder,
        winningBid,
        bidRequest,
      };
    });

    // Emit WebSocket event for real-time updates
    this.eventEmitter.emitOrderCreated({
      orderId: result.newOrder.id,
      bidRequestId: result.bidRequest.id,
      bidId: result.winningBid.id,
      retailerId: result.newOrder.retailerId,
      wholesalerId: result.newOrder.wholesalerId,
      productId: result.newOrder.productId,
      quantity: result.newOrder.quantity,
      totalPrice: result.newOrder.totalPrice,
      discountPercent: result.newOrder.discountPercent,
      mrp: Number(result.newOrder.mrp),
      pickupPoint: result.newOrder.pickupPoint || undefined,
      bucketId: result.newOrder.bucketId || '',
      createdAt: result.newOrder.createdAt,
    });

    // Order created successfully
    return result.newOrder;
  }
}