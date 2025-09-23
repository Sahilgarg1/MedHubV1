import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutoCancelService {
  private readonly logger = new Logger(AutoCancelService.name);

  constructor(private prisma: PrismaService) {}

  // Manual trigger for testing
  async triggerAutoCancel() {
    this.logger.log('Manual trigger: Starting auto-cancel check for expired bid requests...');
    return await this.processAutoCancel();
  }

  // Run every 5 minutes to check for expired bid requests
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAutoCancel() {
    await this.processAutoCancel();
  }

  private async processAutoCancel() {
    
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

      // Find active bid requests that should be auto-cancelled
      // For now, we'll use a simpler approach until the database migration is applied
      const expiredRequests = await this.prisma.bidRequest.findMany({
        where: {
          status: 'ACTIVE',
          // Case 1: Request created more than 1 hour ago
          createdAt: {
            lt: oneHourAgo
          }
        },
        include: {
          bids: {
            where: {
              status: 'PENDING'
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // Filter requests that also have no recent bids (30 minutes)
      const filteredRequests = expiredRequests.filter(request => {
        if (!request.bids || request.bids.length === 0) {
          return true; // No bids, so cancel after 1 hour
        }
        
        // Check if the most recent bid is older than 30 minutes
        const mostRecentBid = request.bids[0];
        return mostRecentBid.createdAt < thirtyMinutesAgo;
      });

      if (filteredRequests.length === 0) {
        this.logger.log('No expired bid requests found.');
        return;
      }

      this.logger.log(`Found ${filteredRequests.length} expired bid requests to cancel.`);

      // Process each expired request
      for (const request of filteredRequests) {
        await this.cancelExpiredRequest(request);
      }

      this.logger.log(`Successfully processed ${filteredRequests.length} expired bid requests.`);
    } catch (error) {
      this.logger.error('Error during auto-cancel process:', error);
    }
  }

  private async cancelExpiredRequest(request: any) {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Update bid request status to INACTIVE
        await tx.bidRequest.update({
          where: { id: request.id },
          data: { 
            status: 'INACTIVE',
            updatedAt: new Date()
          }
        });

        // Update all pending bids to REJECTED
        if (request.bids && request.bids.length > 0) {
          await tx.bid.updateMany({
            where: {
              bidRequestId: request.id,
              status: 'PENDING'
            },
            data: {
              status: 'REJECTED',
              updatedAt: new Date()
            }
          });
        }

        this.logger.log(`Auto-cancelled bid request ${request.id} (created: ${request.createdAt}, lastBid: ${request.lastBidReceivedAt})`);
      });
    } catch (error) {
      this.logger.error(`Failed to cancel bid request ${request.id}:`, error);
    }
  }
}
