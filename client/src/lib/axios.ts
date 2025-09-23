import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { configService } from '../config/config.service';

/**
 * Axios API Instance
 * 
 * Configuration used:
 * - api.baseUrl: API base URL
 * - api.timeout: Request timeout
 * - api.enableLogging: Whether to log requests/responses
 * - api.enableInterceptors: Whether to use interceptors
 * 
 * Used by: All API calls throughout the application
 * 
 * @see config/app.config.ts - apiConfig
 * @see config/config.service.ts - ConfigService.api
 */
export const api = axios.create({
  baseURL: configService.api.baseUrl,
  timeout: configService.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor for adding auth headers and logging
api.interceptors.request.use(
  (config) => {
    // Log request for debugging (only if enabled)
    if (configService.api.enableLogging) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (configService.api.enableLogging) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses (only if enabled)
    if (configService.api.enableLogging) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = (error.response.data as any)?.message || error.message;
      
      if (configService.api.enableLogging) {
        console.error(`❌ API Error ${status}:`, {
          url: error.config?.url,
          method: error.config?.method,
          status,
          message,
          data: error.response.data
        });
      }

      // Handle specific error codes
      switch (status) {
        case 401:
          // Unauthorized - redirect to login or show auth modal
          if (configService.api.enableLogging) {
            console.warn('🔐 Authentication required');
          }
          // You can dispatch an event or call a function to show auth modal
          window.dispatchEvent(new CustomEvent('auth-required'));
          break;
        case 403:
          if (configService.api.enableLogging) {
            console.warn('🚫 Access forbidden');
          }
          break;
        case 404:
          if (configService.api.enableLogging) {
            console.warn('🔍 Resource not found');
          }
          break;
        case 429:
          if (configService.api.enableLogging) {
            console.warn('⏰ Rate limit exceeded');
          }
          break;
        case 500:
          if (configService.api.enableLogging) {
            console.error('🔥 Internal server error');
          }
          break;
        default:
          if (configService.api.enableLogging) {
            console.error(`❌ HTTP Error ${status}: ${message}`);
          }
      }
    } else if (error.request) {
      // Network error - no response received
      if (configService.api.enableLogging) {
        console.error('🌐 Network Error:', {
          url: error.config?.url,
          method: error.config?.method,
          message: 'No response received from server'
        });
        
        // Check if it's a timeout
        if (error.code === 'ECONNABORTED') {
          console.error('⏰ Request timeout');
        }
      }
    } else {
      // Something else happened
      if (configService.api.enableLogging) {
        console.error('❌ Request Setup Error:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

// Export error types for use in components
export type ApiError = AxiosError;
export type ApiResponse<T = any> = AxiosResponse<T>;