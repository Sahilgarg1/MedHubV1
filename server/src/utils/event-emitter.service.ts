import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface UploadProgressEvent {
  distributorId: string;
  totalRows: number;
  processedRows: number;
  matchedCount: number;
  notFoundCount: number;
  percentage: number;
  status: 'processing' | 'completed' | 'error';
  message?: string;
}

export interface BidEvent {
  bidId: string;
  bidRequestId: string;
  wholesalerId: string;
  retailerId: string;
  productId: number;
  discountPercent: number;
  finalPrice: number;
  mrp: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface BidRequestEvent {
  bidRequestId: string;
  retailerId: string;
  productId: number;
  quantity: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderEvent {
  orderId: string;
  bidRequestId: string;
  bidId: string;
  retailerId: string;
  wholesalerId: string;
  productId: number;
  quantity: number;
  totalPrice: number;
  discountPercent: number;
  mrp?: number; // Made optional temporarily
  pickupPoint?: string;
  bucketId: string;
  createdAt: Date;
}

@Injectable()
export class EventEmitterService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Allow more listeners for multiple uploads
  }

  // Upload events
  emitUploadProgress(event: UploadProgressEvent) {
    this.emit('upload-progress', event);
  }

  emitUploadComplete(event: UploadProgressEvent) {
    this.emit('upload-complete', event);
  }

  emitUploadError(distributorId: string, error: string) {
    this.emit('upload-error', { distributorId, error });
  }

  // Bid events
  emitBidCreated(event: BidEvent) {
    this.emit('bid-created', event);
  }

  emitBidUpdated(event: BidEvent) {
    this.emit('bid-updated', event);
  }

  emitBidCancelled(event: BidEvent) {
    this.emit('bid-cancelled', event);
  }

  // Bid request events
  emitBidRequestCreated(event: BidRequestEvent) {
    this.emit('bid-request-created', event);
  }

  emitBidRequestCancelled(event: BidRequestEvent) {
    this.emit('bid-request-cancelled', event);
  }

  // Order events
  emitOrderCreated(event: OrderEvent) {
    this.emit('order-created', event);
  }

  emitOrderUpdated(event: OrderEvent) {
    this.emit('order-updated', event);
  }
}
