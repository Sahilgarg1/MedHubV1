import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

// This function will be called by React Query to fetch the data
const getOrders = async (userId: string, isWholesaler: boolean) => {
  const { data } = await api.get('/orders', {
    // We send our temporary auth headers here
    headers: {
      'x-user-id': userId,
      'x-user-is-wholesaler': isWholesaler.toString(),
    },
  });
  return data;
};

export const useGetOrders = () => {
  const { user } = useAuthStore();

  return useQuery({
    // The query key is an array that uniquely identifies this query.
    // When the user.id changes, React Query will refetch the data.
    queryKey: ['orders', user?.id],
    // The query function to execute.
    queryFn: () => getOrders(user!.id, user!.isWholesaler),
    // This query will only run if a user is logged in.
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
const createOrder = async ({ 
  bidId, 
  userId, 
  pickupPoint
}: { 
  bidId: string; 
  userId: string; 
  pickupPoint?: string;
}) => {
  const { data } = await api.post('/orders', { 
    bidId, 
    pickupPoint
  }, {
    headers: {
      'x-user-id': userId, // Mock Auth
    },
  });
  return data;
};

export const useCreateOrder = () => {

  return useMutation({
    mutationFn: createOrder,
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
