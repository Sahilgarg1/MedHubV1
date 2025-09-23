import { useMutation,  useQuery, useInfiniteQuery } from '@tanstack/react-query'; // Import useQuery
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

interface CreateBidRequestPayload {
  productId: string;
  quantity: number;
}
// --- NEW API FUNCTION ---
const getPlacedRequests = async (userId: string) => {
  const { data } = await api.get('/bid-requests', {
    headers: {
      'x-user-id': userId, // Temporary mock auth
    },
  });
  return data;
};

// --- NEW HOOK ---
export const useGetPlacedRequests = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['placed-requests', user?.id], // The key we will invalidate
    queryFn: () => getPlacedRequests(user!.id),
    enabled: !!user, // Only run the query if the user is logged in
    refetchInterval: 5000, // Refetch every 5 seconds for testing real-time updates
  });
};
const getActiveRequests = async (userId?: string) => {
  if (userId) {
    // For distributors, use the filtered endpoint
    const { data } = await api.get('/bid-requests/active-for-distributor', {
      headers: {
        'x-user-id': userId,
      },
    });
    return data;
  } else {
    // For admin/debugging, use the unfiltered endpoint
    const { data } = await api.get('/bid-requests/active');
    return data;
  }
};

// Infinite query function for active requests
const getActiveRequestsInfinite = async ({ 
  pageParam = 0, 
  userId 
}: { 
  pageParam?: number; 
  userId?: string; 
}) => {
  const limit = 20; // Load 20 items per page
  const offset = pageParam * limit;
  
  if (userId) {
    // For distributors, use the filtered endpoint with pagination
    const { data } = await api.get(`/bid-requests/active-for-distributor?limit=${limit}&offset=${offset}`, {
      headers: {
        'x-user-id': userId,
      },
    });
    return {
      data: data,
      nextCursor: data.length === limit ? pageParam + 1 : undefined,
    };
  } else {
    // For admin/debugging, use the unfiltered endpoint with pagination
    const { data } = await api.get(`/bid-requests/active?limit=${limit}&offset=${offset}`);
    return {
      data: data,
      nextCursor: data.length === limit ? pageParam + 1 : undefined,
    };
  }
};

export const useGetActiveRequests = (userId?: string) => {
  return useQuery({
    // Include userId in query key for proper caching
    queryKey: ['active-requests', userId],
    queryFn: () => getActiveRequests(userId),
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

// Infinite query hook for active requests with lazy loading
export const useGetActiveRequestsInfinite = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ['active-requests-infinite', userId],
    queryFn: ({ pageParam }) => getActiveRequestsInfinite({ pageParam, userId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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

const createBidRequests = async ({
  payload,
  userId,
}: {
  payload: CreateBidRequestPayload[]; // Payload is now an array
  userId: string;
}) => {
  const { data } = await api.post('/bid-requests', payload, {
    headers: {
      'x-user-id': userId,
    },
  });
  return data;
};

export const useCreateBidRequests = () => { // Renamed for clarity

  return useMutation({
    mutationFn: createBidRequests,
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

const cancelBidRequest = async ({
  bidRequestId,
  userId,
}: {
  bidRequestId: string;
  userId: string;
}) => {
  const { data } = await api.delete(`/bid-requests/${bidRequestId}`, {
    headers: {
      'x-user-id': userId,
    },
  });
  return data;
};

export const useCancelBidRequest = () => {

  return useMutation({
    mutationFn: cancelBidRequest,
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