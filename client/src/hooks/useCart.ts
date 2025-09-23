import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useCallback, useRef } from 'react';

// Types
export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    companyName: string;
    mrp: number;
    wholesaler: {
      id: string;
      businessName: string;
      phone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface SyncCartData {
  productId: number;
  quantity: number;
}

// API functions
const getCart = async (userId: string): Promise<CartItem[]> => {
  const response = await api.get('/cart', {
    headers: { 'x-user-id': userId },
  });
  return response.data;
};


const updateCartItem = async (userId: string, productId: string, data: UpdateCartItemData): Promise<CartItem> => {
  const response = await api.put(`/cart/${productId}`, data, {
    headers: { 'x-user-id': userId },
  });
  return response.data;
};

const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  await api.delete(`/cart/${productId}`, {
    headers: { 'x-user-id': userId },
  });
};

const clearCart = async (userId: string): Promise<void> => {
  await api.delete('/cart', {
    headers: { 'x-user-id': userId },
  });
};

const addToCart = async (userId: string, data: AddToCartData): Promise<CartItem> => {
  const response = await api.post('/cart', data, {
    headers: { 'x-user-id': userId },
  });
  return response.data;
};

const syncCart = async (userId: string, cartItems: SyncCartData[]): Promise<void> => {
  await api.post('/cart/sync', cartItems, {
    headers: { 'x-user-id': userId },
  });
};

// React Query hooks
export const useGetCart = (userId: string) => {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: () => getCart(userId),
    enabled: !!userId,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useAddToCart = () => {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AddToCartData }) =>
      addToCart(userId, data),
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useUpdateCartItem = () => {
  
  return useMutation({
    mutationFn: ({ userId, productId, data }: { userId: string; productId: string; data: UpdateCartItemData }) =>
      updateCartItem(userId, productId, data),
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useRemoveFromCart = () => {
  
  return useMutation({
    mutationFn: ({ userId, productId }: { userId: string; productId: string }) =>
      removeFromCart(userId, productId),
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useClearCart = () => {
  
  return useMutation({
    mutationFn: (userId: string) => clearCart(userId),
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useSyncCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, cartItems }: { userId: string; cartItems: SyncCartData[] }) =>
      syncCart(userId, cartItems),
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch cart data after successful sync
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Debounced sync hook to prevent race conditions
export const useDebouncedSyncCart = (delay: number = 500) => {
  const syncCartMutation = useSyncCart();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSync = useCallback((userId: string, cartItems: SyncCartData[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      syncCartMutation.mutate({ userId, cartItems });
    }, delay);
  }, [syncCartMutation, delay]);
  
  return {
    debouncedSync,
    isPending: syncCartMutation.isPending,
    error: syncCartMutation.error,
  };
};
