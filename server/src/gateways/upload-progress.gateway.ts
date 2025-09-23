import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitterService } from '../utils/event-emitter.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  },
})
export class UploadProgressGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventEmitter: EventEmitterService) {
    // Helper function to safely serialize data
    const safeEmit = (eventName: string, data: any) => {
      const safe = JSON.parse(JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      ));
      this.server.emit(eventName, safe);
    };

    // Listen for upload progress events
    this.eventEmitter.on('upload-progress', (data) => {
      safeEmit('upload-progress', data);
    });

    this.eventEmitter.on('upload-complete', (data) => {
      safeEmit('upload-complete', data);
    });

    this.eventEmitter.on('upload-error', (data) => {
      safeEmit('upload-error', data);
    });

    // Listen for bid events
    this.eventEmitter.on('bid-created', (data) => {
      safeEmit('bid-created', data);
    });

    this.eventEmitter.on('bid-updated', (data) => {
      safeEmit('bid-updated', data);
    });

    this.eventEmitter.on('bid-cancelled', (data) => {
      safeEmit('bid-cancelled', data);
    });

    // Listen for bid request events
    this.eventEmitter.on('bid-request-created', (data) => {
      safeEmit('bid-request-created', data);
    });

    this.eventEmitter.on('bid-request-cancelled', (data) => {
      safeEmit('bid-request-cancelled', data);
    });

    // Listen for order events
    this.eventEmitter.on('order-created', (data) => {
      safeEmit('order-created', data);
    });

    this.eventEmitter.on('order-updated', (data) => {
      safeEmit('order-updated', data);
    });
  }

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    // Client disconnected
  }

  @SubscribeMessage('join-upload-room')
  handleJoinRoom(client: Socket, distributorId: string) {
    client.join(`upload-${distributorId}`);
  }

  @SubscribeMessage('leave-upload-room')
  handleLeaveRoom(client: Socket, distributorId: string) {
    client.leave(`upload-${distributorId}`);
  }
}
