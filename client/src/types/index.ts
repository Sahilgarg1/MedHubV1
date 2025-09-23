// Re-export all types from constants
export type {
  BusinessType,
  OrderStatus,
  BidStatus,
  BidRequestStatus,
  FileType,
  STORAGE_KEYS,
} from '../config/constants';

// Import types for use in interfaces
import type { OrderStatus, BidStatus, BidRequestStatus } from '../config/constants';


// Core Entity Types
export interface User {
  id: string;
  phone: string;
  businessName: string;
  isWholesaler: boolean;
  address: string; // Business address
  pickupPoint?: string;
  email?: string;
  contactNumber?: string;
  licenseNumber?: string;
  gstNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  product_name: string;
  manufacturer: string;
  mrp?: number;
  distributors: number[];
  createdAt: string;
  updatedAt: string;
}

export interface BidRequest {
  id: string;
  productId: number;
  retailerId: string;
  quantity: number;
  status: BidRequestStatus;
  product: Product;
  retailer: User;
  bids?: Bid[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  bidRequestId: string;
  wholesalerId: string;
  discountPercent: number;
  mrp?: number;
  expiry?: string;
  status: BidStatus;
  bidRequest: BidRequest;
  wholesaler: User;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  bidId: string;
  retailerId: string;
  wholesalerId: string;
  status: OrderStatus;
  pickupPoint?: string;
  bid: Bid;
  retailer: User;
  wholesaler: User;
  createdAt: string;
  updatedAt: string;
}

export interface OrderBucket {
  id: string;
  retailerId: string;
  wholesalerId: string;
  status: OrderStatus;
  pickupPoint?: string;
  orders: Order[];
  retailer: User;
  wholesaler: User;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  status?: string;
  isWholesaler?: boolean;
}

// Form Types
export interface LoginFormData {
  phone: string;
}

export interface VerifyOtpFormData {
  phone: string;
  otp: string;
}

export interface RegisterFormData {
  phone: string;
  businessName: string;
  isWholesaler: boolean;
  address: string; // Business address
  pickupPoint?: string;
  email?: string;
  contactNumber?: string;
}

export interface UpdateProfileFormData {
  businessName?: string;
  address?: string; // Business address
  pickupPoint?: string;
  email?: string;
  contactNumber?: string;
  licenseNumber?: string;
  gstNumber?: string;
}


export interface CreateBidRequestFormData {
  productId: number;
  quantity: number;
}

export interface CreateBidFormData {
  bidRequestId: string;
  discountPercent: number;
  mrp?: number;
  expiry?: string;
}

export interface CreateOrderFormData {
  bidId: string;
  pickupPoint?: string;
}

export interface AddToCartFormData {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemFormData {
  quantity: number;
}

// Component Props Types
export interface TabViewProps {
  activeTab: 'bids' | 'orders' | 'inventory' | 'profile';
  onTabChange: (tab: 'bids' | 'orders' | 'inventory' | 'profile') => void;
}

export interface TabConfig {
  id: 'bids' | 'orders' | 'inventory' | 'profile';
  label: string;
  icon: any; // React component type
  description: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateData<T = any> {
  state: LoadingState;
  data?: T;
  error?: string;
}

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}

// Event Types
export interface CustomEvent<T = any> extends Event {
  detail: T;
}

export type TabSwitchEvent = CustomEvent<'bids' | 'orders' | 'inventory' | 'profile'>;

// Hook Return Types
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  updateProfile: (data: UpdateProfileFormData) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

export interface UseApiReturn<T = any> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// File Upload Types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface InventoryRow {
  product_name: string;
  manufacturer: string;
  mrp?: number;
  stock?: number;
  batch?: string;
  expiry?: string;
}

export interface UploadResult {
  success: boolean;
  message: string;
  processedRows?: number;
  errors?: string[];
}
