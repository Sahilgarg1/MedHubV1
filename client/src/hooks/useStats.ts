import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

const fetchStats = async (userId: string, isWholesaler: boolean) => {
  // For retailers, return empty stats (they don't have inventory)
  if (!isWholesaler) {
    return {
      activeProducts: 0,
      totalProducts: 0,
      myProducts: 0,
      identifiedProducts: 0,
      unidentifiedProducts: 0,
    };
  }
  
  // For wholesalers, get inventory count from products service
  const { data } = await api.get('/products/inventory-count', {
    headers: {
      'x-user-id': userId,
    },
  });
  return data;
};

export const useStats = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => fetchStats(user?.id || '', user?.isWholesaler || false),
    enabled: !!user?.id && typeof user?.isWholesaler === 'boolean',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
