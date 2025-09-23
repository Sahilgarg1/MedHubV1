import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface BidEvent {
  bidId: string;
  bidRequestId: string;
  wholesalerId: string;
  retailerId: string;
  productId: number;
  productName: string;
  discountPercent: number;
  finalPrice: number;
  mrp: number;
  timestamp: string;
}

interface BidRequestEvent {
  bidRequestId: string;
  retailerId: string;
  productId: number;
  productName: string;
  quantity: number;
  timestamp: string;
}

interface UseWebSocketOptions {
  userId?: string;
  userRole?: boolean; // true = wholesaler, false = retailer
  onBidCreated?: (event: BidEvent) => void;
  onBidUpdated?: (event: BidEvent) => void;
  onBidCancelled?: (event: BidEvent) => void;
  onBidRequestCreated?: (event: BidRequestEvent) => void;
  onBidRequestCancelled?: (event: BidRequestEvent) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if we have a user ID
    if (!options.userId) {
      return;
    }

    // Create socket connection
    const socket = io('http://localhost:3000', {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      upgrade: true,
      rememberUpgrade: false,
    });

    socketRef.current = socket;


    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      setIsConnected(true);
      setError(null);

      // Join appropriate rooms based on user role
      if (options.userRole === false) { // retailer
        socket.emit('join-retailer-room', options.userId);
      } else if (options.userRole === true) { // wholesaler
        socket.emit('join-wholesaler-room', options.userId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('🔌 WebSocket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      // WebSocket reconnected
    });

    socket.on('reconnect_attempt', () => {
      // WebSocket reconnection attempt
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔌 WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🔌 WebSocket reconnection failed');
    });

    // Bid event handlers
    socket.on('bid-created', (event: BidEvent) => {
      options.onBidCreated?.(event);
    });

    socket.on('bid-updated', (event: BidEvent) => {
      options.onBidUpdated?.(event);
    });

    socket.on('bid-cancelled', (event: BidEvent) => {
      options.onBidCancelled?.(event);
    });

    socket.on('bid-request-created', (event: BidRequestEvent) => {
      options.onBidRequestCreated?.(event);
    });

    socket.on('bid-request-cancelled', (event: BidRequestEvent) => {
      options.onBidRequestCancelled?.(event);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [options.userId, options.userRole]);

  // Helper functions
  const joinBidRoom = (bidRequestId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-bid-room', bidRequestId);
    }
  };

  const leaveBidRoom = (bidRequestId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-bid-room', bidRequestId);
    }
  };

  return {
    isConnected,
    error,
    joinBidRoom,
    leaveBidRoom,
  };
};
