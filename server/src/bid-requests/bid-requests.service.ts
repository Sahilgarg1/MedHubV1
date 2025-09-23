import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBidRequestDto } from './dto/create-bid-request.dto';
import { EventEmitterService } from '../utils/event-emitter.service';

@Injectable()
export class BidRequestsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
  ) { }

  async createMany(dtos: CreateBidRequestDto[], retailerId: string) {
    if (!retailerId) {
      throw new UnauthorizedException('Retailer ID is required');
    }

    const createdBidRequests: any[] = [];

    // Create bid requests
    for (const dto of dtos) {
      // Ensure productId is a number
      const productId = typeof dto.productId === 'string' ? parseInt(dto.productId, 10) : dto.productId;
      
      // Get product info to include MRP
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { mrp: true, product_name: true }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      const bidRequest = await this.prisma.bidRequest.create({
        data: {
          quantity: dto.quantity,
          productId: productId,
          retailerId: retailerId,
          status: 'ACTIVE',
        },
        include: {
          product: {
            select: {
              id: true,
              product_name: true,
              manufacturer: true,
              mrp: true,
              distributors: true
            }
          }
        }
      });

      createdBidRequests.push(bidRequest);

      // Emit WebSocket event for real-time updates
      this.eventEmitter.emitBidRequestCreated({
        bidRequestId: bidRequest.id,
        retailerId: retailerId,
        productId: productId,
        quantity: dto.quantity,
        status: bidRequest.status as 'ACTIVE' | 'INACTIVE',
        createdAt: bidRequest.createdAt,
        updatedAt: bidRequest.updatedAt,
      });
    }

    return {
      message: `Successfully created ${createdBidRequests.length} bid requests`,
      count: createdBidRequests.length,
      bidRequests: createdBidRequests
    };
  }
  async findAllActive() {
    // Fetches all bid requests that are currently ACTIVE with best bid info
    console.log(`🔍 [DEBUG] Finding all active bid requests`);
    const requests = await this.prisma.bidRequest.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        product: true,
        bids: {
          select: {
            discountPercent: true,
            finalPrice: true,
            mrp: true,
            status: true,
            isCustomBid: true,
            wholesalerId: true,
            id: true,
            createdAt: true,
          },
          where: {
            status: 'PENDING', // Only include active bids
          },
          orderBy: {
            discountPercent: 'desc', // Highest discount first
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest requests first
      },
    });

    console.log(`🔍 [DEBUG] Found ${requests.length} total active bid requests`);

    // Return requests with full bids array (sorted by discount)
    return requests.map(request => ({
      ...request,
      hasBids: request.bids.length > 0,
    }));
  }

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

  async findAllActiveForDistributor(distributorId: string) {
    // Convert distributor ID to hash for array lookup
    const distributorHash = this.stringToInt(distributorId);
    
    console.log(`🔍 [DEBUG] Finding requests for distributor: ${distributorId} (hash: ${distributorHash})`);
    
    // 🏪 INVENTORY FILTERING: Only show bid requests for products this distributor has inventory for
    const requests = await this.prisma.bidRequest.findMany({
      where: {
        status: 'ACTIVE',
        product: {
          distributors: {
            has: distributorHash  // Only products where this distributor has inventory
          }
        }
      },
      include: {
        product: true,
        bids: {
          select: {
            discountPercent: true,
            finalPrice: true,
            mrp: true,
            status: true,
            wholesalerId: true,
            isCustomBid: true,
            id: true,
            createdAt: true,
          },
          where: {
            status: 'PENDING', // Only include active bids
          },
          orderBy: {
            discountPercent: 'desc', // Highest discount first
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest requests first
      },
    });

    console.log(`🔍 [DEBUG] Found ${requests.length} requests for products with distributor inventory`);

    // Filter out requests where this distributor already has the best bid
    const filteredRequests = requests.filter(request => {
      if (!request.bids || request.bids.length === 0) {
        return true; // Show requests with no bids
      }

      // Find the best bid (highest discount)
      const currentBid = request.bids.reduce((best: any, current: any) => {
        return current.discountPercent > best.discountPercent ? current : best;
      });

      // Only show if this distributor doesn't have the current bid
      return currentBid.wholesalerId !== distributorId;
    });

    console.log(`🔍 [DEBUG] After filtering, returning ${filteredRequests.length} requests`);

    // Add best discount info for competitive display
    return filteredRequests.map(request => ({
      ...request,
      hasBids: request.bids.length > 0,
      // Add flag to show if this distributor already has a bid
      hasMyBid: request.bids.some(bid => bid.wholesalerId === distributorId),
    }));
  }


  async findAllForUser(retailerId: string) {
    if (!retailerId) {
      throw new UnauthorizedException();
    }
    
    const requests = await this.prisma.bidRequest.findMany({
      where: {
        retailerId: retailerId,
        status: 'ACTIVE', // Only show active requests (not converted to orders)
      },
      include: {
        product: true,
        bids: {
          select: {
            id: true,
            discountPercent: true,
            finalPrice: true,
            mrp: true,
            status: true,
            createdAt: true,
            isCustomBid: true,
          },
          orderBy: {
            discountPercent: 'desc', // Highest discount first
          },
          where: {
            status: 'PENDING', // Only show pending bids
            isCustomBid: false, // Only regular bids for competition
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest requests first
      },
    });

    return requests.map(request => ({
      ...request,
      // Return full bids array for proper discount tracking
    }));
  }

  async cancelBidRequest(bidRequestId: string, retailerId: string) {
    if (!retailerId) {
      throw new UnauthorizedException('Retailer ID is required');
    }

    // Find the bid request to ensure it belongs to the retailer
    const bidRequest = await this.prisma.bidRequest.findUnique({
      where: { id: bidRequestId },
      include: { bids: true }
    });

    if (!bidRequest) {
      throw new Error('Bid request not found');
    }

    if (bidRequest.retailerId !== retailerId) {
      throw new UnauthorizedException('You can only cancel your own bid requests');
    }

    if (bidRequest.status === 'INACTIVE') {
      throw new Error('Bid request is already inactive');
    }

    // Emit WebSocket event before deletion for real-time updates
    this.eventEmitter.emitBidRequestCancelled({
      bidRequestId: bidRequest.id,
      retailerId: bidRequest.retailerId,
      productId: bidRequest.productId,
      quantity: bidRequest.quantity,
      status: bidRequest.status as 'ACTIVE' | 'INACTIVE',
      createdAt: bidRequest.createdAt,
      updatedAt: bidRequest.updatedAt,
    });

    // Cancel the bid request by completely deleting it (as per requirements: "vanish with no trails")
    await this.prisma.bidRequest.delete({
      where: { id: bidRequestId }
    });

    // Optionally reject all pending bids for this request
    if (bidRequest.bids.length > 0) {
      await this.prisma.bid.updateMany({
        where: {
          bidRequestId: bidRequestId,
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });
    }

    return { message: 'Bid request cancelled successfully' };
  }

  // DEBUG: Comprehensive distributor filtering debug
  async debugDistributorFiltering(distributorId: string) {
    const distributorHash = this.stringToInt(distributorId);
    
    // Get all active requests
    const allActiveRequests = await this.prisma.bidRequest.findMany({
      where: { status: 'ACTIVE' },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            distributors: true
          }
        }
      }
    });

    // Get products with this distributor's inventory
    const productsWithInventory = await this.prisma.product.findMany({
      where: { distributors: { has: distributorHash } },
      select: {
        id: true,
        product_name: true,
        distributors: true
      }
    });

    // Get requests for products with this distributor's inventory
    const relevantRequests = await this.prisma.bidRequest.findMany({
      where: {
        status: 'ACTIVE',
        product: {
          distributors: { has: distributorHash }
        }
      },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            distributors: true
          }
        },
        bids: {
          select: {
            discountPercent: true,
            wholesalerId: true,
            status: true
          },
          orderBy: { discountPercent: 'desc' }
        }
      }
    });

    return {
      distributorId,
      distributorHash,
      summary: {
        totalActiveRequests: allActiveRequests.length,
        productsWithInventory: productsWithInventory.length,
        relevantRequests: relevantRequests.length
      },
      allActiveRequests: allActiveRequests.map(req => ({
        id: req.id,
        productName: req.product.product_name,
        productId: req.product.id,
        distributors: req.product.distributors
      })),
      productsWithInventory: productsWithInventory.map(p => ({
        id: p.id,
        productName: p.product_name,
        distributors: p.distributors
      })),
      relevantRequests: relevantRequests.map(req => ({
        id: req.id,
        productName: req.product.product_name,
        productId: req.product.id,
        hasBids: req.bids.length > 0,
        bestBid: req.bids.length > 0 ? {
          discountPercent: req.bids[0].discountPercent,
          wholesalerId: req.bids[0].wholesalerId
        } : null
      }))
    };
  }
}