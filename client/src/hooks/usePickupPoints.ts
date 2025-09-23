import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Fetch pickup points from the server
const getPickupPoints = async () => {
  const { data } = await api.get('/constants/pickup-points');
  return data;
};

export const usePickupPoints = () => {
  return useQuery({
    queryKey: ['pickup-points'],
    queryFn: getPickupPoints,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
