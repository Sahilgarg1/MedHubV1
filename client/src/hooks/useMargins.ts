import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

interface Margin {
  id: number;
  class: string;
  margin: number;
}

export const useMargins = () => {
  return useQuery({
    queryKey: ['margins'],
    queryFn: async (): Promise<Margin[]> => {
      const response = await api.get('/constants/margins');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};

export const useMarginByClass = (productClass: string) => {
  const { data: margins } = useMargins();
  
  const margin = margins?.find((m: Margin) => m.class === productClass);
  return margin?.margin || 6; // Default to 6% for Class D
};
