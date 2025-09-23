// =============================================================================
// TradeMed Client - Routes Configuration
// =============================================================================

/**
 * Client Routes Configuration
 * 
 * This file defines all client-side routes for the TradeMed application.
 * Routes are organized by feature and include proper path parameters.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // App Routes
  APP: '/app',
  
  // Bid Management Routes
  BIDS: {
    BASE: '/app/bids',
    LIVE: '/app/bids/live',
    MY_BIDS: '/app/bids/my-bids',
    SUBMITTED: '/app/bids/submitted',
    CREATE: '/app/bids/create',
    EDIT: '/app/bids/:id/edit',
    VIEW: '/app/bids/:id',
  },
  
  // Bid Requests Routes
  BID_REQUESTS: {
    BASE: '/app/bid-requests',
    LIST: '/app/bid-requests',
    CREATE: '/app/bid-requests/create',
    EDIT: '/app/bid-requests/:id/edit',
    VIEW: '/app/bid-requests/:id',
    MY_REQUESTS: '/app/bid-requests/my-requests',
  },
  
  // Orders Routes
  ORDERS: {
    BASE: '/app/orders',
    LIST: '/app/orders',
    CREATE: '/app/orders/create',
    EDIT: '/app/orders/:id/edit',
    VIEW: '/app/orders/:id',
    MY_ORDERS: '/app/orders/my-orders',
    TRACKING: '/app/orders/:id/tracking',
  },
  
  // Inventory Routes
  INVENTORY: {
    BASE: '/app/inventory',
    LIST: '/app/inventory',
    ADD: '/app/inventory/add',
    EDIT: '/app/inventory/:id/edit',
    VIEW: '/app/inventory/:id',
    UPLOAD: '/app/inventory/upload',
    BULK_EDIT: '/app/inventory/bulk-edit',
    EXPORT: '/app/inventory/export',
  },
  
  // Products Routes
  PRODUCTS: {
    BASE: '/app/products',
    LIST: '/app/products',
    ADD: '/app/products/add',
    EDIT: '/app/products/:id/edit',
    VIEW: '/app/products/:id',
    SEARCH: '/app/products/search',
    CATEGORIES: '/app/products/categories',
    BRANDS: '/app/products/brands',
  },
  
  // Profile Routes
  PROFILE: {
    BASE: '/app/profile',
    VIEW: '/app/profile',
    EDIT: '/app/profile/edit',
    SETTINGS: '/app/profile/settings',
    PREFERENCES: '/app/profile/preferences',
    SECURITY: '/app/profile/security',
    NOTIFICATIONS: '/app/profile/notifications',
  },
  
  // Cart Routes
  CART: {
    BASE: '/app/cart',
    VIEW: '/app/cart',
    CHECKOUT: '/app/cart/checkout',
  },
  
  
  // Support Routes
  SUPPORT: {
    BASE: '/app/support',
    CONTACT: '/app/support/contact',
    FAQ: '/app/support/faq',
    HELP: '/app/support/help',
    TICKETS: '/app/support/tickets',
    CREATE_TICKET: '/app/support/tickets/create',
    VIEW_TICKET: '/app/support/tickets/:id',
  },
  
  // Admin Routes
  ADMIN: {
    BASE: '/app/admin',
    DASHBOARD: '/app/admin/dashboard',
    USERS: '/app/admin/users',
    PRODUCTS: '/app/admin/products',
    ORDERS: '/app/admin/orders',
    STATS: '/app/admin/stats',
    SETTINGS: '/app/admin/settings',
    LOGS: '/app/admin/logs',
  },
  
  // Settings Routes
  SETTINGS: {
    BASE: '/app/settings',
    GENERAL: '/app/settings/general',
    NOTIFICATIONS: '/app/settings/notifications',
    PRIVACY: '/app/settings/privacy',
    SECURITY: '/app/settings/security',
    BILLING: '/app/settings/billing',
  },
  
  // Error Routes
  ERROR: {
    BASE: '/error',
    NOT_FOUND: '/error/404',
    UNAUTHORIZED: '/error/401',
    FORBIDDEN: '/error/403',
    SERVER_ERROR: '/error/500',
    MAINTENANCE: '/error/maintenance',
  },
} as const;

// Route Parameters
export const ROUTE_PARAMS = {
  ID: ':id',
  USER_ID: ':userId',
  PRODUCT_ID: ':productId',
  BID_ID: ':bidId',
  ORDER_ID: ':orderId',
  REQUEST_ID: ':requestId',
  TICKET_ID: ':ticketId',
  CATEGORY_ID: ':categoryId',
  BRAND_ID: ':brandId',
} as const;

// Query Parameters
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  SORT: 'sort',
  ORDER: 'order',
  STATUS: 'status',
  ROLE: 'role',
  CATEGORY: 'category',
  BRAND: 'brand',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  MIN_PRICE: 'minPrice',
  MAX_PRICE: 'maxPrice',
  IN_STOCK: 'inStock',
  FEATURED: 'featured',
  TAB: 'tab',
  FILTER: 'filter',
} as const;

// Route Groups for Navigation
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.LANDING,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
  ],
  AUTHENTICATED: [
    ROUTES.APP,
    ROUTES.BIDS.BASE,
    ROUTES.BID_REQUESTS.BASE,
    ROUTES.ORDERS.BASE,
    ROUTES.INVENTORY.BASE,
    ROUTES.PRODUCTS.BASE,
    ROUTES.PROFILE.BASE,
    ROUTES.CART.BASE,
    ROUTES.SUPPORT.BASE,
    ROUTES.SETTINGS.BASE,
  ],
  ADMIN_ONLY: [
    ROUTES.ADMIN.BASE,
  ],
  ERROR_PAGES: [
    ROUTES.ERROR.NOT_FOUND,
    ROUTES.ERROR.UNAUTHORIZED,
    ROUTES.ERROR.FORBIDDEN,
    ROUTES.ERROR.SERVER_ERROR,
    ROUTES.ERROR.MAINTENANCE,
  ],
} as const;

// Navigation Menu Structure
export const NAVIGATION_MENU = {
  MAIN: [
    {
      key: 'bids',
      label: 'Live Bids',
      path: ROUTES.BIDS.LIVE,
      icon: 'TrendingUp',
    },
    {
      key: 'orders',
      label: 'Orders',
      path: ROUTES.ORDERS.LIST,
      icon: 'ShoppingCart',
    },
    {
      key: 'inventory',
      label: 'Inventory',
      path: ROUTES.INVENTORY.LIST,
      icon: 'Package',
    },
    {
      key: 'profile',
      label: 'Profile',
      path: ROUTES.PROFILE.VIEW,
      icon: 'User',
    },
  ],
  SECONDARY: [
    {
      key: 'bid-requests',
      label: 'Bid Requests',
      path: ROUTES.BID_REQUESTS.LIST,
      icon: 'FileText',
    },
    {
      key: 'products',
      label: 'Products',
      path: ROUTES.PRODUCTS.LIST,
      icon: 'Grid',
    },
    {
      key: 'support',
      label: 'Support',
      path: ROUTES.SUPPORT.CONTACT,
      icon: 'HelpCircle',
    },
  ],
} as const;

// Type definitions
export type Routes = typeof ROUTES;
export type RouteParams = typeof ROUTE_PARAMS;
export type QueryParams = typeof QUERY_PARAMS;
export type RouteGroups = typeof ROUTE_GROUPS;
export type NavigationMenu = typeof NAVIGATION_MENU;
