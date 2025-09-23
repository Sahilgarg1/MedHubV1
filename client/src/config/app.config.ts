/**
 * TradeMed Frontend Application Configuration
 * 
 * This file centralizes all environment variables, constants, and configuration
 * settings for the TradeMed frontend application. All configuration should be
 * accessed through this centralized system.
 * 
 * @author TradeMed Team
 * @version 1.0.0
 */

/**
 * Application Environment Configuration
 * 
 * Defines the application's runtime environment and basic settings.
 * Used by: main.tsx, App.tsx, all components
 */
export const appConfig = {
  /**
   * Application Environment
   * - development: Local development with hot reload
   * - production: Production deployment
   * - test: Testing environment
   * 
   * Used by: All components for environment-specific behavior
   * Default: 'development'
   */
  nodeEnv: import.meta.env.MODE || 'development',

  /**
   * Application Name
   * Used for logging, headers, and identification
   * 
   * Used by: App.tsx, logging services
   * Default: 'TradeMed'
   */
  name: import.meta.env.VITE_APP_NAME || 'TradeMed',

  /**
   * Application Version
   * Used for API versioning and health checks
   * 
   * Used by: health endpoints, API documentation
   * Default: '1.0.0'
   */
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',

  /**
   * Application Description
   * Used for meta tags and documentation
   * 
   * Used by: index.html, documentation
   * Default: 'B2B Pharmaceutical Trading Platform'
   */
  description: import.meta.env.VITE_APP_DESCRIPTION || 'B2B Pharmaceutical Trading Platform',

  /**
   * Check if running in development
   * 
   * Used by: All components for development features
   */
  isDevelopment: import.meta.env.DEV,

  /**
   * Check if running in production
   * 
   * Used by: All components for production behavior
   */
  isProduction: import.meta.env.PROD,

  /**
   * Check if running in test environment
   * 
   * Used by: Test suites and testing utilities
   */
  isTest: import.meta.env.MODE === 'test',
} as const;

/**
 * API Configuration
 * 
 * Backend API connection and settings.
 * Used by: axios instance, all API calls
 */
export const apiConfig = {
  /**
   * API Base URL
   * Base URL for all API requests
   * 
   * Used by: axios instance, all API calls
   * Default: 'http://localhost:3000' (backend server)
   */
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  /**
   * API Timeout
   * Request timeout in milliseconds
   * 
   * Used by: axios instance
   * Default: 30000 (30 seconds)
   */
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),

  /**
   * API Retry Attempts
   * Number of retry attempts for failed requests
   * 
   * Used by: axios interceptors
   * Default: 3
   */
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3', 10),

  /**
   * Enable API Logging
   * Whether to log API requests and responses
   * 
   * Used by: axios interceptors
   * Default: true in development, false in production
   */
  enableLogging: import.meta.env.VITE_API_ENABLE_LOGGING === 'true' || appConfig.isDevelopment,

  /**
   * Enable Request/Response Interceptors
   * Whether to use axios interceptors
   * 
   * Used by: axios setup
   * Default: true
   */
  enableInterceptors: import.meta.env.VITE_API_ENABLE_INTERCEPTORS !== 'false',
} as const;

/**
 * UI Configuration
 * 
 * User interface settings and theming.
 * Used by: All components, theme providers
 */
export const uiConfig = {
  /**
   * Theme Configuration
   */
  theme: {
    /**
     * Primary Color
     * Main brand color
     * 
     * Used by: All components, theme provider
     * Default: '#3b82f6' (blue-500)
     */
    primary: import.meta.env.VITE_THEME_PRIMARY || '#3b82f6',

    /**
     * Secondary Color
     * Secondary brand color
     * 
     * Used by: All components, theme provider
     * Default: '#10b981' (emerald-500)
     */
    secondary: import.meta.env.VITE_THEME_SECONDARY || '#10b981',

    /**
     * Accent Color
     * Accent color for highlights
     * 
     * Used by: All components, theme provider
     * Default: '#f59e0b' (amber-500)
     */
    accent: import.meta.env.VITE_THEME_ACCENT || '#f59e0b',

    /**
     * Success Color
     * Color for success states
     * 
     * Used by: All components, theme provider
     * Default: '#10b981' (emerald-500)
     */
    success: import.meta.env.VITE_THEME_SUCCESS || '#10b981',

    /**
     * Warning Color
     * Color for warning states
     * 
     * Used by: All components, theme provider
     * Default: '#f59e0b' (amber-500)
     */
    warning: import.meta.env.VITE_THEME_WARNING || '#f59e0b',

    /**
     * Error Color
     * Color for error states
     * 
     * Used by: All components, theme provider
     * Default: '#ef4444' (red-500)
     */
    error: import.meta.env.VITE_THEME_ERROR || '#ef4444',

    /**
     * Info Color
     * Color for info states
     * 
     * Used by: All components, theme provider
     * Default: '#3b82f6' (blue-500)
     */
    info: import.meta.env.VITE_THEME_INFO || '#3b82f6',
  },

  /**
   * Breakpoints Configuration
   */
  breakpoints: {
    /**
     * Small Breakpoint
     * 
     * Used by: Responsive components
     * Default: '640px'
     */
    sm: import.meta.env.VITE_BREAKPOINT_SM || '640px',

    /**
     * Medium Breakpoint
     * 
     * Used by: Responsive components
     * Default: '768px'
     */
    md: import.meta.env.VITE_BREAKPOINT_MD || '768px',

    /**
     * Large Breakpoint
     * 
     * Used by: Responsive components
     * Default: '1024px'
     */
    lg: import.meta.env.VITE_BREAKPOINT_LG || '1024px',

    /**
     * Extra Large Breakpoint
     * 
     * Used by: Responsive components
     * Default: '1280px'
     */
    xl: import.meta.env.VITE_BREAKPOINT_XL || '1280px',
  },

  /**
   * Animation Configuration
   */
  animations: {
    /**
     * Animation Durations
     */
    duration: {
      /**
       * Fast Animation Duration
       * 
       * Used by: All animated components
       * Default: '150ms'
       */
      fast: import.meta.env.VITE_ANIMATION_DURATION_FAST || '150ms',

      /**
       * Normal Animation Duration
       * 
       * Used by: All animated components
       * Default: '300ms'
       */
      normal: import.meta.env.VITE_ANIMATION_DURATION_NORMAL || '300ms',

      /**
       * Slow Animation Duration
       * 
       * Used by: All animated components
       * Default: '500ms'
       */
      slow: import.meta.env.VITE_ANIMATION_DURATION_SLOW || '500ms',
    },

    /**
     * Enable Animations
     * Whether to enable animations
     * 
     * Used by: All animated components
     * Default: true
     */
    enabled: import.meta.env.VITE_ANIMATIONS_ENABLED !== 'false',
  },

  /**
   * UI Constants
   */
  constants: {
    /**
     * Debounce Delay
     * Delay for input debouncing in milliseconds
     * 
     * Used by: Search inputs, form inputs
     * Default: 300
     */
    debounceDelay: parseInt(import.meta.env.VITE_UI_DEBOUNCE_DELAY || '300', 10),

    /**
     * Toast Duration
     * Duration for toast notifications in milliseconds
     * 
     * Used by: Toast components
     * Default: 5000
     */
    toastDuration: parseInt(import.meta.env.VITE_UI_TOAST_DURATION || '5000', 10),

    /**
     * Modal Z-Index
     * Z-index for modal overlays
     * 
     * Used by: Modal components
     * Default: 1000
     */
    modalZIndex: parseInt(import.meta.env.VITE_UI_MODAL_Z_INDEX || '1000', 10),

    /**
     * Dropdown Z-Index
     * Z-index for dropdown menus
     * 
     * Used by: Dropdown components
     * Default: 1001
     */
    dropdownZIndex: parseInt(import.meta.env.VITE_UI_DROPDOWN_Z_INDEX || '1001', 10),
  },
} as const;

/**
 * Business Logic Configuration
 * 
 * Application-specific business rules and limits.
 * Used by: All business logic components
 */
export const businessConfig = {
  /**
   * File Upload Configuration
   */
  fileUpload: {
    /**
     * Maximum File Size
     * Maximum file size in bytes
     * 
     * Used by: File upload components
     * Default: 10MB
     */
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024,

    /**
     * Supported File Types
     * Array of supported file extensions
     * 
     * Used by: File upload components
     * Default: ['csv', 'xlsx']
     */
    supportedTypes: (import.meta.env.VITE_SUPPORTED_FILE_TYPES || 'csv,xlsx').split(','),

    /**
     * Allowed MIME Types
     * Array of allowed MIME types
     * 
     * Used by: File upload components
     * Default: CSV and Excel MIME types
     */
    allowedMimeTypes: (import.meta.env.VITE_ALLOWED_MIME_TYPES || 'text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').split(','),
  },

  /**
   * Pagination Configuration
   */
  pagination: {
    /**
     * Default Page Size
     * Default number of items per page
     * 
     * Used by: All list components
     * Default: 10
     */
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10', 10),

    /**
     * Maximum Page Size
     * Maximum number of items per page
     * 
     * Used by: All list components
     * Default: 100
     */
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10),
  },

  /**
   * Search Configuration
   */
  search: {
    /**
     * Search Debounce Delay
     * Delay for search input debouncing in milliseconds
     * 
     * Used by: Search components
     * Default: 500
     */
    debounceDelay: parseInt(import.meta.env.VITE_SEARCH_DEBOUNCE_DELAY || '500', 10),

    /**
     * Minimum Search Length
     * Minimum characters required for search
     * 
     * Used by: Search components
     * Default: 2
     */
    minLength: parseInt(import.meta.env.VITE_SEARCH_MIN_LENGTH || '2', 10),

    /**
     * Maximum Search Results
     * Maximum number of search results to display
     * 
     * Used by: Search components
     * Default: 50
     */
    maxResults: parseInt(import.meta.env.VITE_SEARCH_MAX_RESULTS || '50', 10),
  },

  /**
   * Discount Configuration
   */
  discount: {
    /**
     * Discount Buffer
     * Buffer percentage for retailer discounts
     * 
     * Used by: Discount calculation components
     * Default: 5
     */
    buffer: parseInt(import.meta.env.VITE_DISCOUNT_BUFFER || '5', 10),

    /**
     * Minimum Discount
     * Minimum discount percentage
     * 
     * Used by: Discount validation
     * Default: 0
     */
    min: parseInt(import.meta.env.VITE_DISCOUNT_MIN || '0', 10),

    /**
     * Maximum Discount
     * Maximum discount percentage
     * 
     * Used by: Discount validation
     * Default: 100
     */
    max: parseInt(import.meta.env.VITE_DISCOUNT_MAX || '100', 10),
  },
} as const;

/**
 * Feature Flags Configuration
 * 
 * Feature toggles for enabling/disabling functionality.
 * Used by: All components for feature gating
 */
export const featuresConfig = {
  /**
   * Enable Inventory Upload
   * Whether to enable inventory upload functionality
   * 
   * Used by: Inventory components
   * Default: true
   */
  enableInventoryUpload: import.meta.env.VITE_FEATURE_INVENTORY_UPLOAD !== 'false',

  /**
   * Enable Real-time Updates
   * Whether to enable real-time updates
   * 
   * Used by: All components with real-time features
   * Default: true
   */
  enableRealTimeUpdates: import.meta.env.VITE_FEATURE_REAL_TIME_UPDATES !== 'false',

  /**
   * Enable Advanced Search
   * Whether to enable advanced search functionality
   * 
   * Used by: Search components
   * Default: true
   */
  enableAdvancedSearch: import.meta.env.VITE_FEATURE_ADVANCED_SEARCH !== 'false',

  /**
   * Enable Bulk Operations
   * Whether to enable bulk operations
   * 
   * Used by: List components
   * Default: true
   */
  enableBulkOperations: import.meta.env.VITE_FEATURE_BULK_OPERATIONS !== 'false',

  /**
   * Enable SMS Authentication
   * Whether to enable SMS authentication
   * 
   * Used by: Authentication components
   * Default: true
   */
  enableSmsAuth: import.meta.env.VITE_FEATURE_SMS_AUTH !== 'false',

  /**
   * Enable File Compression
   * Whether to enable file compression
   * 
   * Used by: File upload components
   * Default: false
   */
  enableFileCompression: import.meta.env.VITE_FEATURE_FILE_COMPRESSION === 'true',

  /**
   * Enable Dark Mode
   * Whether to enable dark mode
   * 
   * Used by: Theme components
   * Default: true
   */
  enableDarkMode: import.meta.env.VITE_FEATURE_DARK_MODE !== 'false',
} as const;

/**
 * Authentication Configuration
 * 
 * Authentication and security settings.
 * Used by: Authentication components, auth hooks
 */
export const authConfig = {
  /**
   * OTP Configuration
   */
  otp: {
    /**
     * OTP Length
     * Number of digits in OTP
     * 
     * Used by: OTP input components
     * Default: 6
     */
    length: parseInt(import.meta.env.VITE_OTP_LENGTH || '6', 10),

    /**
     * OTP Expiration Time (minutes)
     * How long OTPs are valid
     * 
     * Used by: OTP components
     * Default: 10
     */
    expirationMinutes: parseInt(import.meta.env.VITE_OTP_EXPIRATION_MINUTES || '10', 10),

    /**
     * OTP Cooldown Period (seconds)
     * Time to wait between OTP requests
     * 
     * Used by: OTP components
     * Default: 60
     */
    cooldownSeconds: parseInt(import.meta.env.VITE_OTP_COOLDOWN_SECONDS || '60', 10),
  },

  /**
   * Session Configuration
   */
  session: {
    /**
     * Session Timeout (minutes)
     * How long user sessions last
     * 
     * Used by: Auth components
     * Default: 30
     */
    timeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '30', 10),

    /**
     * Auto Logout Warning (minutes)
     * Warning time before auto logout
     * 
     * Used by: Auth components
     * Default: 5
     */
    warningMinutes: parseInt(import.meta.env.VITE_SESSION_WARNING_MINUTES || '5', 10),
  },

  /**
   * Storage Configuration
   */
  storage: {
    /**
     * Auth Token Key
     * Local storage key for auth token
     * 
     * Used by: Auth components
     * Default: 'auth_token'
     */
    authTokenKey: import.meta.env.VITE_STORAGE_AUTH_TOKEN_KEY || 'auth_token',

    /**
     * User Data Key
     * Local storage key for user data
     * 
     * Used by: Auth components
     * Default: 'user_data'
     */
    userDataKey: import.meta.env.VITE_STORAGE_USER_DATA_KEY || 'user_data',

    /**
     * Theme Key
     * Local storage key for theme
     * 
     * Used by: Theme components
     * Default: 'theme'
     */
    themeKey: import.meta.env.VITE_STORAGE_THEME_KEY || 'theme',

    /**
     * Language Key
     * Local storage key for language
     * 
     * Used by: Language components
     * Default: 'language'
     */
    languageKey: import.meta.env.VITE_STORAGE_LANGUAGE_KEY || 'language',

    /**
     * Cart Key
     * Local storage key for cart
     * 
     * Used by: Cart components
     * Default: 'cart'
     */
    cartKey: import.meta.env.VITE_STORAGE_CART_KEY || 'cart',
  },
} as const;

/**
 * Development Configuration
 * 
 * Development-specific settings and debugging options.
 * Used by: Development tools, debugging
 */
export const developmentConfig = {
  /**
   * Enable Debug Mode
   * Whether to enable debug logging
   * 
   * Used by: All components
   * Default: true in development
   */
  enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || appConfig.isDevelopment,

  /**
   * Enable React Query Devtools
   * Whether to enable React Query devtools
   * 
   * Used by: React Query setup
   * Default: true in development
   */
  enableReactQueryDevtools: import.meta.env.VITE_REACT_QUERY_DEVTOOLS !== 'false' && appConfig.isDevelopment,

  /**
   * Enable Performance Monitoring
   * Whether to enable performance monitoring
   * 
   * Used by: Performance monitoring
   * Default: false
   */
  enablePerformanceMonitoring: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',

  /**
   * Mock API Responses
   * Whether to mock API responses
   * 
   * Used by: API components
   * Default: false
   */
  mockApiResponses: import.meta.env.VITE_MOCK_API_RESPONSES === 'true',
} as const;

/**
 * Export all configurations
 */
export const config = {
  app: appConfig,
  api: apiConfig,
  ui: uiConfig,
  business: businessConfig,
  features: featuresConfig,
  auth: authConfig,
  development: developmentConfig,
} as const;

/**
 * Export types for better TypeScript support
 */
export type AppConfig = typeof appConfig;
export type ApiConfig = typeof apiConfig;
export type UiConfig = typeof uiConfig;
export type BusinessConfig = typeof businessConfig;
export type FeaturesConfig = typeof featuresConfig;
export type AuthConfig = typeof authConfig;
export type DevelopmentConfig = typeof developmentConfig;
export type Config = typeof config;