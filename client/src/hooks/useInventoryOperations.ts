import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Batch clear individual products
const clearIndividualProducts = async ({ userId, productIds }: { userId: string; productIds: number[] }) => {
  const { data } = await api.delete('/products/clear-individual-products', {
    headers: {
      'x-user-id': userId,
    },
    data: { productIds },
  });
  return data;
};

// Batch update products
const batchUpdateProducts = async ({ userId, updates }: { 
  userId: string; 
  updates: Array<{
    productId: number;
    mrp?: number;
    stock?: number;
    batch?: string;
    expiry?: string;
  }> 
}) => {
  const { data } = await api.post('/products/batch-update', {
    updates,
  }, {
    headers: {
      'x-user-id': userId,
    },
  });
  return data;
};

// Custom hook for clearing individual products
export const useClearIndividualProducts = () => {
  
  return useMutation({
    mutationFn: clearIndividualProducts,
  });
};

// Custom hook for batch updating products
export const useBatchUpdateProducts = () => {
  
  return useMutation({
    mutationFn: batchUpdateProducts,
  });
};
