import { useQuery, useMutation } from '@tanstack/react-query'; // Ensure useQuery is imported
import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

const uploadInventory = async ({ 
    file, 
    userId, 
    onProgress 
}: { 
    file: File; 
    userId: string; 
    onProgress?: (progress: number) => void;
}) => {
    const formData = new FormData();
    formData.append('file', file); // The field name must match the backend interceptor

    const { data } = await api.post('/products/upload-inventory', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-user-id': userId, // Temporary mock auth header
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            }
        },
    });
    return data;
};
const searchProducts = async (searchTerm: string) => {
    if (!searchTerm) {
        return []; // Return an empty array if the search term is empty
    }
    const { data } = await api.get(`/products/available?search=${searchTerm}`);
    return data;
};

// Custom hook for debounced search
export const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, delay]);

    return debouncedSearchTerm;
};

export const useSearchProducts = (searchTerm: string) => {
    const debouncedSearchTerm = useDebouncedSearch(searchTerm, 200); // 200ms debounce
    
    return useQuery({
        queryKey: ['products', debouncedSearchTerm],
        queryFn: () => searchProducts(debouncedSearchTerm),
        enabled: !!debouncedSearchTerm && debouncedSearchTerm.length > 0, // Only run query when debouncedSearchTerm exists
        staleTime: 300000, // Keep in cache for 5 minutes
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
export const useUploadInventory = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const mutation = useMutation({
        mutationFn: ({ file, userId }: { file: File; userId: string }) => {
            setUploadProgress(1); // Start with 1% to show something immediately
            return uploadInventory({ 
                file, 
                userId, 
                onProgress: setUploadProgress 
            });
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
    
    return {
        ...mutation,
        uploadProgress,
    };
};

const clearInventory = async (userId: string, deleteActiveBids: boolean = false) => {
    const { data } = await api.delete('/products/clear-inventory', {
        headers: {
            'x-user-id': userId,
        },
        params: {
            deleteActiveBids: deleteActiveBids.toString(),
        },
    });
    return data;
};

export const useClearInventory = () => {
    
    return useMutation({
        mutationFn: ({ userId, deleteActiveBids }: { userId: string; deleteActiveBids: boolean }) => 
            clearInventory(userId, deleteActiveBids),
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