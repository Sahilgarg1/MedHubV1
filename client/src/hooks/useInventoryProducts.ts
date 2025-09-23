import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

interface Product {
  id: number;
  product_name: string;
  manufacturer?: string;
  mrp?: number;
  batch?: string;
  expiry?: string;
}

const fetchInventoryProducts = async (userId: string, page: number = 0, limit: number = 20): Promise<Product[]> => {
  const { data } = await api.get(`/products/available?page=${page}&limit=${limit}`, {
    headers: {
      'x-user-id': userId,
    },
  });
  return data;
};

export const useInventoryProducts = (page: number = 0, limit: number = 20) => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['inventory-products', user?.id, page, limit],
    queryFn: () => fetchInventoryProducts(user?.id || '', page, limit),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
