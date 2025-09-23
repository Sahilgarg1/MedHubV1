import { useMutation,  useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

interface CreateBidPayload {
  bidRequestId: string;
  discountPercent: number;
  mrp: number; // Required MRP
}

const createBid = async ({
  payload,
  userId,
}: {
  payload: CreateBidPayload; // <-- CORRECTED TYPE
  userId: string;
}) => {
  const { data } = await api.post('/bids', payload, {
    headers: {
      'x-user-id': userId, // Temporary mock auth
    },
  });
  return data;
};
// --- NEW API FUNCTION & HOOK ---
const getSubmittedBids = async (userId: string) => {
  const { data } = await api.get('/bids', {
    headers: {
      'x-user-id': userId, // Mock Auth
    },
  });
  return data;
};

const cancelBid = async ({
  bidId,
  userId,
}: {
  bidId: string;
  userId: string;
}) => {
  const { data } = await api.delete(`/bids/${bidId}`, {
    headers: {
      'x-user-id': userId, // Temporary mock auth
    },
  });
  return data;
};

export const useGetSubmittedBids = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['submitted-bids', user?.id],
    queryFn: () => getSubmittedBids(user!.id),
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds for testing real-time updates
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
export const useCreateBid = () => {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (payload: CreateBidPayload) => createBid({ payload, userId: user!.id }),
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

export const useCancelBid = () => {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ bidId }: { bidId: string }) => cancelBid({ bidId, userId: user!.id }),
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