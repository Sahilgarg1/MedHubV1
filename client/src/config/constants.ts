/**
 * TradeMed Frontend Constants
 * 
 * This file centralizes all application constants, enums, and static values
 * used throughout the TradeMed frontend application.
 * 
 * @author TradeMed Team
 * @version 1.0.0
 */

/**
 * User Types
 * 
 * Used by: Authentication components, role-based access control
 */
export const USER_TYPES = {
  RETAILER: false,
  WHOLESALER: true,
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

/**
 * Business Types
 * 
 * Used by: Business registration components
 */
export const BUSINESS_TYPES = {
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
} as const;

export type BusinessType = typeof BUSINESS_TYPES[keyof typeof BUSINESS_TYPES];

/**
 * Order Status
 * 
 * Used by: Order management components
 */
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

/**
 * Bid Status
 * 
 * Used by: Bid management components
 */
export const BID_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export type BidStatus = typeof BID_STATUS[keyof typeof BID_STATUS];

/**
 * Bid Request Status
 * 
 * Used by: Bid request components
 */
export const BID_REQUEST_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type BidRequestStatus = typeof BID_REQUEST_STATUS[keyof typeof BID_REQUEST_STATUS];

/**
 * File Types
 * 
 * Used by: File upload components
 */
export const FILE_TYPES = {
  CSV: 'csv',
  XLSX: 'xlsx',
  EXCEL: 'xlsx',
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

/**
 * MIME Types
 * 
 * Used by: File upload components, file validation
 */
export const MIME_TYPES = {
  CSV: 'text/csv',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  EXCEL: 'application/vnd.ms-excel',
} as const;

export type MimeType = typeof MIME_TYPES[keyof typeof MIME_TYPES];

/**
 * Validation Rules
 * 
 * Used by: Form validation, input components
 */
export const VALIDATION_RULES = {
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[6-9]\d{9}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  GST: {
    PATTERN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  },
  DISCOUNT: {
    MIN: 0,
    MAX: 100,
  },
  PRICE: {
    MIN: 0.01,
    MAX: 1000000,
  },
  QUANTITY: {
    MIN: 1,
    MAX: 10000,
  },
  BUSINESS_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  ADDRESS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
} as const;

/**
 * Error Messages
 * 
 * Used by: Error handling, form validation
 */
export const ERROR_MESSAGES = {
  // General Errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Validation Errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_GST: 'Please enter a valid GST number.',
  INVALID_DISCOUNT: 'Discount must be between 0 and 100.',
  INVALID_PRICE: 'Price must be greater than 0.',
  INVALID_QUANTITY: 'Quantity must be at least 1.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a CSV or Excel file.',
  FILE_TOO_LARGE: 'File size is too large. Maximum size is 10MB.',

  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid credentials.',
  ACCOUNT_LOCKED: 'Your account has been locked.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_OTP: 'Invalid verification code.',
  OTP_EXPIRED: 'Verification code has expired.',
  OTP_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',

  // Business Logic Errors
  INSUFFICIENT_STOCK: 'Insufficient stock available.',
  ORDER_NOT_FOUND: 'Order not found.',
  BID_NOT_FOUND: 'Bid not found.',
  BID_EXPIRED: 'Bid has expired.',
  BID_ALREADY_ACCEPTED: 'Bid has already been accepted.',
  BID_ALREADY_REJECTED: 'Bid has already been rejected.',
} as const;

/**
 * Success Messages
 * 
 * Used by: Success notifications, form submissions
 */
export const SUCCESS_MESSAGES = {
  // General Success
  OPERATION_SUCCESSFUL: 'Operation completed successfully.',
  DATA_SAVED: 'Data saved successfully.',
  DATA_UPDATED: 'Data updated successfully.',
  DATA_DELETED: 'Data deleted successfully.',

  // Authentication Success
  LOGIN_SUCCESSFUL: 'Login successful.',
  LOGOUT_SUCCESSFUL: 'Logout successful.',
  REGISTRATION_SUCCESSFUL: 'Registration successful.',
  OTP_SENT: 'Verification code sent successfully.',
  OTP_VERIFIED: 'Verification code verified successfully.',

  // Business Logic Success
  ORDER_PLACED: 'Order placed successfully.',
  ORDER_UPDATED: 'Order updated successfully.',
  ORDER_CANCELLED: 'Order cancelled successfully.',
  BID_PLACED: 'Bid placed successfully.',
  BID_ACCEPTED: 'Bid accepted successfully.',
  BID_REJECTED: 'Bid rejected successfully.',
  INVENTORY_UPLOADED: 'Inventory uploaded successfully.',
  CART_UPDATED: 'Cart updated successfully.',
} as const;

/**
 * Loading Messages
 * 
 * Used by: Loading states, async operations
 */
export const LOADING_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  SENDING_OTP: 'Sending verification code...',
  VERIFYING_OTP: 'Verifying code...',
  PLACING_ORDER: 'Placing order...',
  PLACING_BID: 'Placing bid...',
} as const;

/**
 * API Endpoints
 * 
 * Used by: API calls, axios configuration
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    INITIATE: '/auth/initiate',
    VERIFY: '/auth/verify',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/update-profile',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    SEARCH: '/products/search',
    DETAILS: '/products/:id',
    UPLOAD: '/products/upload',
    CLEAR: '/products/clear',
  },

  // Bids
  BIDS: {
    LIST: '/bids',
    CREATE: '/bids',
    UPDATE: '/bids/:id',
    DELETE: '/bids/:id',
    ACCEPT: '/bids/:id/accept',
    REJECT: '/bids/:id/reject',
  },

  // Bid Requests
  BID_REQUESTS: {
    LIST: '/bid-requests',
    CREATE: '/bid-requests',
    UPDATE: '/bid-requests/:id',
    DELETE: '/bid-requests/:id',
    DETAILS: '/bid-requests/:id',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    DELETE: '/orders/:id',
    DETAILS: '/orders/:id',
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },

  // Statistics
  STATS: {
    DASHBOARD: '/stats/dashboard',
    SALES: '/stats/sales',
    ORDERS: '/stats/orders',
    BIDS: '/stats/bids',
  },

  // Constants
  CONSTANTS: {
    SUPPORT_CONTACTS: '/constants/support-contacts',
    BUSINESS_CONFIG: '/constants/business-config',
    PICKUP_POINTS: '/constants/pickup-points',
    VALIDATION_RULES: '/constants/validation-rules',
    SYSTEM_MESSAGES: '/constants/system-messages',
  },
} as const;

/**
 * Local Storage Keys
 * 
 * Used by: Storage utilities, persistence
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  CART: 'cart',
  RECENT_SEARCHES: 'recent_searches',
  PREFERENCES: 'preferences',
  DRAFT_ORDER: 'draft_order',
  DRAFT_BID: 'draft_bid',
} as const;

/**
 * Query Keys for React Query
 * 
 * Used by: React Query hooks, cache management
 */
export const QUERY_KEYS = {
  // Authentication
  AUTH: {
    USER: ['auth', 'user'],
    PROFILE: ['auth', 'profile'],
  },

  // Products
  PRODUCTS: {
    LIST: ['products', 'list'],
    SEARCH: ['products', 'search'],
    DETAILS: ['products', 'details'],
  },

  // Bids
  BIDS: {
    LIST: ['bids', 'list'],
    DETAILS: ['bids', 'details'],
  },

  // Bid Requests
  BID_REQUESTS: {
    LIST: ['bid-requests', 'list'],
    DETAILS: ['bid-requests', 'details'],
  },

  // Orders
  ORDERS: {
    LIST: ['orders', 'list'],
    DETAILS: ['orders', 'details'],
  },

  // Cart
  CART: {
    ITEMS: ['cart', 'items'],
  },

  // Statistics
  STATS: {
    DASHBOARD: ['stats', 'dashboard'],
    SALES: ['stats', 'sales'],
    ORDERS: ['stats', 'orders'],
    BIDS: ['stats', 'bids'],
  },

  // Constants
  CONSTANTS: {
    SUPPORT_CONTACTS: ['constants', 'support-contacts'],
    BUSINESS_CONFIG: ['constants', 'business-config'],
    PICKUP_POINTS: ['constants', 'pickup-points'],
    VALIDATION_RULES: ['constants', 'validation-rules'],
    SYSTEM_MESSAGES: ['constants', 'system-messages'],
  },
} as const;

/**
 * Event Names for Custom Events
 * 
 * Used by: Event handling, component communication
 */
export const EVENT_NAMES = {
  // Authentication Events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_REGISTER: 'user:register',

  // Cart Events
  CART_ADD: 'cart:add',
  CART_REMOVE: 'cart:remove',
  CART_UPDATE: 'cart:update',
  CART_CLEAR: 'cart:clear',

  // Order Events
  ORDER_PLACE: 'order:place',
  ORDER_UPDATE: 'order:update',
  ORDER_CANCEL: 'order:cancel',

  // Bid Events
  BID_PLACE: 'bid:place',
  BID_ACCEPT: 'bid:accept',
  BID_REJECT: 'bid:reject',

  // UI Events
  THEME_CHANGE: 'ui:theme:change',
  LANGUAGE_CHANGE: 'ui:language:change',
  MODAL_OPEN: 'ui:modal:open',
  MODAL_CLOSE: 'ui:modal:close',
} as const;

/**
 * HTTP Status Codes
 * 
 * Used by: API error handling, response processing
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Date and Time Formats
 * 
 * Used by: Date formatting, time display
 */
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * Currency Configuration
 * 
 * Used by: Price display, currency formatting
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;

/**
 * Export all constants as a single object
 */
export const CONSTANTS = {
  USER_TYPES,
  BUSINESS_TYPES,
  ORDER_STATUS,
  BID_STATUS,
  BID_REQUEST_STATUS,
  FILE_TYPES,
  MIME_TYPES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  QUERY_KEYS,
  EVENT_NAMES,
  HTTP_STATUS,
  DATE_FORMATS,
  CURRENCY,
} as const;
