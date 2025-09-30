import React, { useState, useRef, useEffect } from 'react';
import { useSearchProducts } from '../../hooks/useProducts';
import { useCreateBidRequests, useGetPlacedRequests, useCancelBidRequest } from '../../hooks/useBidRequests';
import { useGetCart, useDebouncedSyncCart, useClearCart } from '../../hooks/useCart';
import { useAuthStore } from '../../stores/authStore';
import { useDiscountTracking } from '../../hooks/useDiscountTracking';
import { useCreateOrder } from '../../hooks/useOrders';
import { useMarginByClass } from '../../hooks/useMargins';
import { calculateRetailerDiscount, calculateRetailerPrice } from '../../utils/discountUtils';
import { BidRequestCard } from './BidRequestCard';
import { ConfirmationModal, SuccessModal } from '../common/ModalComponents';
import { OrderModal } from '../common/OrderModal';
import { Plus, Package, ShoppingCart, ChevronUp, ChevronDown, X, Minus, ArrowRight, RefreshCw, Filter, MoreVertical, CheckCircle } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';


// RetailerBidRequestCard component (moved from separate file)
interface RetailerBidRequestCardProps {
  // Common props from BidRequestCard
  id: string;
  product: {
    manufacturer?: string;
    product_name: string;
    mrp: number;
    class?: string;
  };
  quantity: number;
  bids?: any[];
  discountChanges?: Record<string, boolean>;
  highlightedBidRequestId?: string | null;
  userHascurrentBid?: boolean;
  createdAt: string;
  
  // Retailer-specific props
  onOrderSuccess?: () => void;
  onCancelSuccess?: () => void;
}

const RetailerBidRequestCard = ({
  id,
  product,
  quantity,
  bids = [],
  discountChanges = {},
  highlightedBidRequestId,
  userHascurrentBid = false,
  createdAt,
  onOrderSuccess,
  onCancelSuccess,
}: RetailerBidRequestCardProps) => {
  const { user } = useAuthStore();
  // Pickup points functionality removed - not used in current implementation
  const createOrderMutation = useCreateOrder();
  const cancelBidRequestMutation = useCancelBidRequest();
  
  // Get margin for this product's class
  const productClass = product.class || 'D';
  const marginValue = useMarginByClass(productClass);
  
  // Selected pickup point functionality removed - not used in current implementation
  const [pendingBidId, setPendingBidId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Apply margin-based discount to all bids for retailer view
  const marginAdjustedBids = bids.map(bid => ({
    ...bid,
    // Apply margin-based discount calculation for retailer view
    discountPercent: calculateRetailerDiscount(bid.discountPercent, productClass, marginValue),
    finalPrice: calculateRetailerPrice(bid.mrp || product.mrp, bid.discountPercent, productClass, marginValue)
  }));

  // Find the current bid (highest discount) from the margin-adjusted bids
  const currentBid = marginAdjustedBids.length > 0 ? marginAdjustedBids[0] : null;

  const handleAcceptBid = (bidId: string) => {
    if (!user) return;
    setPendingBidId(bidId);
    setShowModal(true);
  };

  const handleConfirmOrderWithModal = (pickupPoint?: string) => {
    if (!user) {
      alert('User not authenticated.');
      return;
    }
    setShowModal(false);
    
    if (pendingBidId) {
      createOrderMutation.mutate(
        { 
          bidId: pendingBidId, 
          userId: user.id,
          pickupPoint: pickupPoint
        },
        {
          onSuccess: () => {
            setPendingBidId(null);
            onOrderSuccess?.();
          },
          onError: (error: any) => {
            console.error('Order creation failed:', error);
            alert('Failed to place order. Please try again.');
          }
        }
      );
    }
  };

  const handleCancelRequest = () => {
    if (!user) return;
    if (window.confirm('Are you sure you want to cancel this bid request?')) {
      cancelBidRequestMutation.mutate(
        { bidRequestId: id, userId: user.id },
        {
          onSuccess: () => {
            setShowMenu(false);
            alert('Bid request cancelled successfully!');
            // Call the success callback if provided
            if (onCancelSuccess) {
              onCancelSuccess();
            }
          },
          onError: (error) => {
            console.error('Failed to cancel bid request:', error);
            alert('Failed to cancel bid request. Please try again.');
          },
        }
      );
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const menuElements = document.querySelectorAll('[data-menu-container]');
      const isClickInsideMenu = Array.from(menuElements).some(element => 
        element.contains(target)
      );
      
      if (!isClickInsideMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Use the common BidRequestCard */}
      <BidRequestCard
        id={id}
        product={product}
        quantity={quantity}
        bids={marginAdjustedBids}
        discountChanges={discountChanges}
        highlightedBidRequestId={highlightedBidRequestId}
        userHascurrentBid={userHascurrentBid}
        createdAt={createdAt}
        type="retailer"
        // Retailer-specific content will be handled in the custom content area
        customContent={
          currentBid ? (
            /* Bid Action Section - Optimized for space efficiency */
            <div className="relative px-2 py-2 border-t border-gray-200">
              {/* Place Order Button - Positioned at bottom edge with rounded top corners */}
              <button 
                onClick={() => handleAcceptBid(currentBid.id)}
                disabled={createOrderMutation.isPending}
                className={`
                  absolute bottom-2 right-0 z-10 flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium shadow-sm
                  transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1
                  ${createOrderMutation.isPending 
                    ? 'bg-warning text-white cursor-not-allowed' 
                    : 'bg-success text-white hover:bg-success-dark focus:ring-success'
                  }
                `}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Placing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} />
                    <span className="text-xs">Place Order</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-between gap-2 pr-24">
                {/* Price Overview - Minimal styling, maximum space efficiency */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {currentBid.mrp && currentBid.mrp > 0 && (
                    <div className="flex flex-col items-center bg-white rounded px-2 py-1 flex-1 min-w-0">
                      <span className="text-xs text-gray-500 mb-0.5">MRP</span>
                      <span className="text-xs font-semibold text-gray-800 truncate">₹{currentBid.mrp.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center bg-white rounded px-2 py-1 flex-1 min-w-0">
                    <span className="text-xs text-gray-500 mb-0.5">Bid Price</span>
                    <span className="text-xs font-semibold text-gray-800 truncate">₹{currentBid.finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-center bg-white rounded px-6 py-1 flex-1 min-w-0">
                    <span className="text-xs text-gray-500 mb-0.5">Total</span>
                    <span className="text-sm font-bold text-gray-800 truncate">₹{(currentBid.finalPrice * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Waiting for Bids Section - Height matched to bids available section */
            <div className="py-3.5 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-gray-700 flex-1 min-w-0">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-sm">⏳</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Waiting for bids</p>
                    <p className="text-xs text-gray-600 truncate">Wholesalers are reviewing your request</p>
                  </div>
                </div>
                
                {/* Menu Button - Minimal styling for consistency */}
                <div className="relative flex-shrink-0" data-menu-container>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`
                      p-1.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1
                      ${showMenu 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    title="More options"
                  >
                    <MoreVertical size={14} />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 min-w-[120px]">
                      <button
                        onClick={handleCancelRequest}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="text-red-500">✕</span>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      />

      {/* Order Confirmation Modal */}
      <OrderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmOrderWithModal}
        productName={product.product_name}
        quantity={quantity}
        totalPrice={currentBid ? (currentBid.finalPrice * quantity) : 0}
        isLoading={createOrderMutation.isPending}
      />
    </div>
  );
};

// Define the shape of a product from search results (has different fields than the main Product type)
interface SearchProduct {
  id: number;
  product_name: string;
  manufacturer: string;
  mrp?: number;
  distributors: number[];
  similarity: number;
  search_rank?: number;
}

// Define the shape of an item in our request "cart"
interface RequestItem {
  product: SearchProduct;
  quantity: number;
}

// Define the shape of a placed request from the API
interface PlacedRequest {
  id: string;
  productId: number;
  status: 'ACTIVE' | 'INACTIVE';
  quantity: number;
  createdAt: string;
  product: {
    id: number;
    product_name: string;
    manufacturer: string;
    mrp?: number;
  };
  bids?: Array<{
    id: string;
    discountPercent: number;
    finalPrice: number;
    mrp: number;
    status: string;
    createdAt: string;
  }>;
}

// Define the shape of a cart item from the database
interface DbCartItem {
  id: string;
  quantity: number;
  product: {
    id: string | number;
    product_name: string;
    manufacturer: string;
    mrp?: number;
  };
  createdAt: string;
  updatedAt: string;
}


// LiveBidsView component (moved from separate file)
export const LiveBidsView = () => {
  // Get the logged-in user from our global store
  const { user } = useAuthStore();

  // If the user is a retailer, show the retailer view.
  if (!user?.isWholesaler) {
    return <RetailerBidsView />;
  }

  // If the user is a wholesaler, show the wholesaler view.
  if (user?.isWholesaler) {
    // Import WholesalerBidsView dynamically to avoid circular dependency
    const WholesalerBidsView = React.lazy(() => import('./WholesalerBidsView').then(module => ({ default: module.WholesalerBidsView })));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <WholesalerBidsView />
      </React.Suspense>
    );
  }

  // Fallback in case the user object is somehow not available
  return <div>Loading your view...</div>;
};

export const RetailerBidsView = () => {
  // Component State
  const [searchTerm, setSearchTerm] = useState('');
  const [requestCart, setRequestCart] = useState<RequestItem[]>([]); // Local cart state for UI
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] = useState(false); // Show duplicate confirmation modal
  const [duplicateItems, setDuplicateItems] = useState<RequestItem[]>([]); // Items that already have requests
  const [existingRequestsToReplace, setExistingRequestsToReplace] = useState<PlacedRequest[]>([]); // Existing requests that will be replaced
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Track search input focus
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track blur timeout
  const [searchItemQuantities, setSearchItemQuantities] = useState<Record<number, number>>({}); // Track quantities for search items
  const isInteractingWithDropdownRef = useRef(false); // Track if user is interacting with dropdown
  const [isCartExpanded, setIsCartExpanded] = useState(false); // Track cart expansion state
  const cartDropdownRef = useRef<HTMLDivElement>(null); // Ref for cart dropdown
  const cartButtonRef = useRef<HTMLButtonElement>(null); // Ref for cart button
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for search input
  const [showEmptyCartHint, setShowEmptyCartHint] = useState(false); // Track empty cart hint visibility
  
  // State for refresh and filter functionality
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestFilter, setRequestFilter] = useState<'all' | 'waiting' | 'received'>('all');
  
  // Global State & API Hooks (must be before useState that uses user)
  const { user } = useAuthStore();

  // Error and loading states
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // State for Order All functionality (from PlacedRequestsList)
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [bulkOrderData, setBulkOrderData] = useState<{
    totalItems: number;
    totalPrice: number;
    requestCount: number;
  } | null>(null);
  // Pickup points functionality removed - not used in current implementation
  
  // Refs for cleanup
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: searchResults, isFetching: isSearching } = useSearchProducts(searchTerm);
  const createBidRequestsMutation = useCreateBidRequests();
  const cancelBidRequestMutation = useCancelBidRequest();
  const createOrderMutation = useCreateOrder();
  const { data: placedRequests, refetch: refetchPlacedRequests, isLoading: isPlacedRequestsLoading, isError: isPlacedRequestsError, error: placedRequestsError } = useGetPlacedRequests();
  
  // Use discount tracking for animations (from PlacedRequestsList)
  const { discountChanges } = useDiscountTracking(Array.isArray(placedRequests) ? placedRequests : []);
  
  // 🔥 REAL-TIME UPDATES: WebSocket integration
  useWebSocket({
    userId: user?.id,
    userRole: false, // false = retailer
    onBidCreated: () => {
      refetchPlacedRequests();
    },
    onBidUpdated: () => {
      refetchPlacedRequests();
    },
    onBidCancelled: () => {
      refetchPlacedRequests();
    },
    onBidRequestCreated: () => {
      refetchPlacedRequests();
    },
    onBidRequestCancelled: () => {
      refetchPlacedRequests();
    },
  });
  
  // Filter requests to only show active ones - ensure requests is an array (from PlacedRequestsList)
  const activeRequests = Array.isArray(placedRequests) ? placedRequests.filter((req: any) => req.status === 'ACTIVE') : [];

  // Apply additional filters (from PlacedRequestsList)
  const filteredRequests = activeRequests.filter((req: any) => {
    if (requestFilter === 'all') return true;
    if (requestFilter === 'waiting') return !req.bids || req.bids.length === 0;
    if (requestFilter === 'received') return req.bids && req.bids.length > 0;
    return true;
  });

  // Get requests that have bids (for bulk ordering) (from PlacedRequestsList)
  const requestsWithBids = activeRequests.filter((req: any) => req.bids && req.bids.length > 0);
  
  // Cart persistence hooks
  const { data: dbCart, isLoading: isCartLoading, refetch: refetchCart } = useGetCart(user?.id || '');
  const { debouncedSync } = useDebouncedSyncCart(300);
  const clearCartMutation = useClearCart();
  

  // Data validation utilities
  const validateCartItem = (item: any): item is DbCartItem => {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.product &&
      typeof item.product === 'object' &&
      (typeof item.product.id === 'string' || typeof item.product.id === 'number') &&
      typeof item.product.product_name === 'string' &&
      typeof item.product.manufacturer === 'string'
    );
  };

  const validatePlacedRequest = (request: any): request is PlacedRequest => {
    return (
      request &&
      typeof request === 'object' &&
      typeof request.id === 'string' &&
      typeof request.productId === 'number' &&
      typeof request.status === 'string' &&
      typeof request.quantity === 'number' &&
      request.quantity > 0 &&
      request.product &&
      typeof request.product === 'object'
    );
  };

  const safeParseInt = (value: string | number): number => {
    const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
    return isNaN(parsed) ? 1 : Math.max(1, parsed);
  };

  // Refresh handler with improved error handling
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Refetch both placed requests and cart data with individual error handling
      const results = await Promise.allSettled([
        refetchPlacedRequests(),
        refetchCart()
      ]);
      
      const errors: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = index === 0 ? 'placed requests' : 'cart data';
          errors.push(`Failed to refresh ${operation}`);
          console.error(`Failed to refresh ${operation}:`, result.reason);
        }
      });
      
      if (errors.length > 0) {
        setError(errors.join(', '));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to refresh data: ${errorMessage}`);
      console.error("Failed to refresh data:", error);
    } finally {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      // Reset refreshing state after a short delay
      refreshTimeoutRef.current = setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Ensure cart is loaded when user becomes available
  useEffect(() => {
    if (user?.id && !isCartLoading && dbCart === undefined) {
      refetchCart();
    }
  }, [user?.id, isCartLoading, dbCart, refetchCart]);


  // Sync local cart with database cart on load with validation
  useEffect(() => {
    if (dbCart && Array.isArray(dbCart) && user?.id) {
      try {
        const localCartItems: RequestItem[] = dbCart
          .filter(validateCartItem) // Filter out invalid items
          .map((item: any) => ({
            product: {
              id: safeParseInt(item.product.id),
              product_name: item.product.product_name || 'Unknown Product',
              manufacturer: item.product.manufacturer || 'Unknown Manufacturer',
              mrp: item.product.mrp || 0,
              distributors: [], // Cart items don't have distributors info
              similarity: 0, // Cart items don't have similarity
              search_rank: 0, // Cart items don't have search rank
            },
            quantity: Math.max(1, item.quantity),
          }));
        
        setRequestCart(localCartItems);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error processing cart data:', error);
        setError('Failed to load cart data. Please refresh the page.');
        setRequestCart([]); // Fallback to empty cart
      }
    } else if (!user?.id) {
      // Clear cart when user logs out
      setRequestCart([]);
      setError(null);
    }
  }, [dbCart, user?.id, isCartLoading]);

  // Handle clicking outside cart to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node) &&
          cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        //setIsCartExpanded(false);
      }
    };

    if (isCartExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartExpanded]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Order All handlers (from PlacedRequestsList)
  const handleBulkOrder = () => {
    if (requestsWithBids.length === 0) {
      alert('No requests with bids available for bulk ordering.');
      return;
    }
    
    // Calculate bulk order totals
    const totalItems = requestsWithBids.reduce((sum, req) => sum + req.quantity, 0);
    const totalPrice = requestsWithBids.reduce((sum, req) => {
      const winningBid = req.bids[0];
      const productClass = req.product?.class || 'D'; // Get product class from request data
      const retailerPrice = calculateRetailerPrice(winningBid.mrp, winningBid.discountPercent, productClass);
      return sum + (retailerPrice * req.quantity);
    }, 0);
    
    setBulkOrderData({
      totalItems,
      totalPrice,
      requestCount: requestsWithBids.length
    });
    setShowBulkOrderModal(true);
  };

  const handleConfirmBulkOrder = async (pickupPoint?: string) => {
    if (!pickupPoint) {
      alert('Please select a pickup point to continue.');
      return;
    }
    
    if (!bulkOrderData) return;
    
    setShowBulkOrderModal(false);
    
    try {
      // Place orders for all requests with bids
      const orderPromises = requestsWithBids.map(async (req) => {
        const winningBid = req.bids[0];
        try {
          const result = await createOrderMutation.mutateAsync({
            bidId: winningBid.id,
            userId: user!.id,
            pickupPoint: pickupPoint
          });
          return { success: true, result, requestId: req.id };
        } catch (error) {
          console.error(`Failed to place order for request ${req.id}:`, error);
          return { success: false, error, requestId: req.id };
        }
      });
      
      const results = await Promise.allSettled(orderPromises);
      const successfulOrders = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      );
      const failedOrders = results.filter(result => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );
      
      
      if (successfulOrders.length > 0) {
        // Clear the cart after successful orders
        if (user?.id) {
          clearCartMutation.mutate(user.id);
        }
        
        if (failedOrders.length === 0) {
          // All orders successful
          setShowOrderSuccessModal(true);
        } else {
          // Some orders failed
          alert(`${successfulOrders.length} orders placed successfully, but ${failedOrders.length} orders failed. Please check your orders and try again for the failed ones.`);
        }
      } else {
        // All orders failed
        alert('All orders failed to place. Please try again.');
      }
      
    } catch (error) {
      console.error('Bulk order processing failed:', error);
      alert('An error occurred while processing your orders. Please try again.');
    }
  };

  // Helper function to sync local cart changes to database with improved error handling
  const syncCartToDatabase = async (newCart: RequestItem[]) => {
    if (!user?.id) {
      console.warn('Cannot sync cart: user not authenticated');
      return;
    }
    
    // Validate cart items before sending
    const validCartItems = newCart.filter(item => 
      item && 
      item.product && 
      typeof item.product.id === 'number' && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    );
    
    if (validCartItems.length !== newCart.length) {
      console.warn('Some cart items were invalid and filtered out');
    }
    
    const cartItems: Array<{ productId: number; quantity: number }> = validCartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));
    
    // Use debounced sync to prevent race conditions
    debouncedSync(user.id, cartItems);
  };



  // --- MODIFIED HANDLERS ---

  // Modal form handler removed - now handled directly in search results

  // Submits all items in the cart at once
  const handleSubmitAllRequests = () => {
    if (requestCart.length === 0 || !user) return;

    // Check for duplicates with existing requests
    if (placedRequests && Array.isArray(placedRequests) && placedRequests.length > 0) {
      const duplicateItems: RequestItem[] = [];
      const existingRequests: PlacedRequest[] = [];

      requestCart.forEach(cartItem => {
        const existingRequest = placedRequests.find((req: any) => {
          if (!validatePlacedRequest(req)) return false;
          return req.productId === cartItem.product.id && req.status === 'ACTIVE';
        });
        if (existingRequest && validatePlacedRequest(existingRequest)) {
          duplicateItems.push(cartItem);
          existingRequests.push(existingRequest);
        }
      });

      if (duplicateItems.length > 0) {
        setDuplicateItems(duplicateItems);
        setExistingRequestsToReplace(existingRequests);
        setShowDuplicateConfirmation(true);
        return;
      }
    }

    // If no duplicates, proceed with submission
    submitRequests();
  };

  // Actual submission logic with improved error handling
  const submitRequests = () => {
    if (requestCart.length === 0 || !user) {
      console.warn('Cannot submit requests: empty cart or no user');
      return;
    }

    // Validate cart items before submission
    const validCartItems = requestCart.filter(item => 
      item && 
      item.product && 
      typeof item.product.id === 'number' && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    );

    if (validCartItems.length === 0) {
      setError('No valid items in cart to submit');
      return;
    }

    if (validCartItems.length !== requestCart.length) {
      console.warn('Some cart items were invalid and filtered out');
      setError('Some items in your cart were invalid and have been removed');
    }

    const payload = validCartItems.map((item) => ({
      productId: item.product.id.toString(),
      quantity: item.quantity,
    }));

    createBidRequestsMutation.mutate(
      { payload, userId: user.id },
      {
        onSuccess: () => {
          const successMessage = `Successfully submitted ${validCartItems.length} bid request${validCartItems.length > 1 ? 's' : ''}!`;
          alert(successMessage);
          setRequestCart([]); // Clear the cart
          syncCartToDatabase([]); // Clear the database cart
          setShowDuplicateConfirmation(false); // Close confirmation modal
          setError(null); // Clear any errors
        },
        onError: (error: any) => {
          console.error('Failed to place bid requests:', error);
          
          // Provide specific error messages based on error type
          let errorMessage = 'Failed to submit requests. Please try again.';
          
          if (error?.response?.status === 400) {
            errorMessage = 'Invalid request data. Please check your cart items.';
          } else if (error?.response?.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (error?.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error?.message) {
            errorMessage = `Error: ${error.message}`;
          }
          
          setError(errorMessage);
          alert(errorMessage);
        },
      },
    );
  };

  // Handle confirmation modal actions
  const handleConfirmSubmission = async () => {
    if (!user) return;
    
    setShowDuplicateConfirmation(false);
    
    // First cancel existing requests that will be replaced
    if (existingRequestsToReplace.length > 0) {
      try {
        await Promise.all(
          existingRequestsToReplace.map((existingRequest: any) =>
            cancelBidRequestMutation.mutateAsync({
              bidRequestId: existingRequest.id,
              userId: user.id
            })
          )
        );
      } catch (error) {
        console.error('Failed to cancel existing requests:', error);
        alert('Failed to replace existing requests. Please try again.');
        return;
      }
    }
    
    // Then submit new requests
    submitRequests();
  };


  // Handle search input focus/blur
  const handleSearchFocus = () => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsSearchFocused(true);
  };

  const handleSearchBlur = (e: React.FocusEvent) => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Check if the focus is moving to an element within the search dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    const searchDropdown = document.querySelector('.search-dropdown');
    
    if (relatedTarget && searchDropdown && searchDropdown.contains(relatedTarget)) {
      return; // Don't close the dropdown if focus is moving within it
    }
    
    // If user is currently interacting with dropdown, don't close it
    if (isInteractingWithDropdownRef.current) {
      return;
    }
    
    // Set a timeout to close the dropdown, allowing click events to register
    blurTimeoutRef.current = setTimeout(() => {
      setIsSearchFocused(false);
      blurTimeoutRef.current = null;
    }, 300); // Increased timeout to allow for interactions
  };

  // Handle clicking on search results - prevent blur from closing modal
  // Search result click handler removed - now handled directly in search results

  // Handle product selection from search results (removed - now handled directly in search results)

  // Product modal handlers removed


  // Cart item click handler removed - no longer using modal

  // Modal quantity handlers removed

  // Handle quick quantity adjustment for cart items with validation
  const adjustCartItemQuantity = (index: number, delta: number) => {
    setRequestCart(prevCart => {
      if (index < 0 || index >= prevCart.length) {
        console.warn('Invalid cart item index:', index);
        return prevCart;
      }
      
      const newCart = prevCart.map((item, i) => {
        if (i === index) {
          const newQuantity = Math.max(1, Math.min(999, item.quantity + delta));
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      // Sync to database
      syncCartToDatabase(newCart);
      
      return newCart;
    });
  };

  // Handle search item quantity changes with validation
  const setSearchItemQuantity = (productId: number, quantity: number) => {
    const validQuantity = Math.max(1, Math.min(999, quantity)); // Limit between 1 and 999
    setSearchItemQuantities(prev => ({
      ...prev,
      [productId]: validQuantity
    }));
  };

  const adjustSearchItemQuantity = (productId: number, delta: number) => {
    setSearchItemQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(1, Math.min(999, currentQuantity + delta));
      return {
        ...prev,
        [productId]: newQuantity
      };
    });
  };

  // Order placement UI moved to PlacedRequestsList

  // Pickup points not used in this view anymore

  // Handle adding to cart directly from search results
  const handleAddToCartFromSearch = (product: SearchProduct) => {
    const quantity = searchItemQuantities[product.id] || 1;
    
    // Check if the product is already in the cart
    const existingItemIndex = requestCart.findIndex(
      (item) => item.product.id === product.id,
    );

    setRequestCart(prevCart => {
      let newCart;
      
      if (existingItemIndex !== -1) {
        // Product already exists, update quantity
        newCart = prevCart.map((item, i) =>
          i === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // New product, add to cart
        newCart = [
          ...prevCart,
          { product, quantity }
        ];
      }
      
      // Sync to database
      syncCartToDatabase(newCart);
      
      return newCart;
    });

    // Reset quantity for this search item
    setSearchItemQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));

    // Close search dropdown
    setIsSearchFocused(false);
    setSearchTerm('');
    
    // Auto-expand cart when adding items
    setIsCartExpanded(true);
  };


  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="mx-3 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Sync Error Display */}
      {syncError && (
        <div className="mx-3 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-yellow-700">{syncError}</p>
            </div>
            <button
              onClick={() => setSyncError(null)}
              className="text-yellow-500 hover:text-yellow-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="flex-shrink-0 mt-2 mb-0 px-3">
            <label htmlFor="medicine-search" className="sr-only">Search medicines</label>
            <div className="relative w-full">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Package size={20} className="text-gray-500" />
                </div>
                <input
                  ref={searchInputRef}
                  id="medicine-search"
                  name="medicine-search"
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Auto-collapse cart when user types in search bar
                    // if (isCartExpanded) {
                    //   setIsCartExpanded(false);
                    // }
                  }}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onClick={handleSearchFocus}
                  className="w-full pl-14 pr-4 py-6 border border-gray-200 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:outline-none text-base bg-white shadow-sm rounded-lg transition-all duration-200"
                  autoComplete="off"
                />
                {/* Cart Button */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <button
                    ref={cartButtonRef}
                    onClick={() => {
                      if (requestCart.length === 0) {
                        // Show hint message and focus search input
                        setShowEmptyCartHint(true);
                        setTimeout(() => setShowEmptyCartHint(false), 3000); // Hide after 3 seconds
                        searchInputRef.current?.focus();
                      } else {
                        setIsCartExpanded(!isCartExpanded);
                      }
                    }}
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 lg:px-4 lg:py-2 bg-transparent text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                  >
                    <ShoppingCart size={16} className="lg:w-5 lg:h-5" />
                    <span className="font-medium">{requestCart.length}</span>
                    <span className="hidden lg:inline font-medium">Cart</span>
                    {isCartExpanded ? <ChevronUp size={14} className="lg:w-4 lg:h-4" /> : <ChevronDown size={14} className="lg:w-4 lg:h-4" />}
                  </button>
                </div>
              </div>

              {searchTerm && searchTerm.length > 0 && isSearchFocused && (
                <div 
                  className="absolute top-full left-0 right-0 mt-0 bg-white border-0 shadow-lg z-50 max-h-80 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                  onFocus={(e) => e.preventDefault()}
                  onMouseEnter={() => isInteractingWithDropdownRef.current = true}
                  onMouseLeave={() => isInteractingWithDropdownRef.current = false}
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-4 h-4"></div>
                      <span>Searching products...</span>
                    </div>
                  ) : searchResults && Array.isArray(searchResults) && searchResults.length > 0 ? (
                    <div className="px-0 sm:px-4 py-1.5">
                      {searchResults.map((product: SearchProduct) => (
                        <div 
                          key={product.id} 
                          className="py-2 px-0 sm:px-4 mx-2 sm:mx-0 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5">
                                    {product.product_name}
                                  </h4>
                                  <p className="text-gray-500 text-xs leading-snug mb-1">
                                    {product.manufacturer || 'Manufacturer not specified'}
                                  </p>
                                  {product.mrp && product.mrp > 0 && (
                                    <p className="text-gray-600 text-xs leading-snug mb-1 font-medium">
                                      MRP: ₹{product.mrp.toFixed(2)}
                                    </p>
                                  )}
                                  {/* Distributor availability info */}
                                  {product.distributors.length > 0 ? (
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                      <span className="text-[11px] text-green-600 font-medium">
                                        {product.distributors.length} distributor{product.distributors.length !== 1 ? 's' : ''} available
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                      <span className="text-[11px] text-gray-500 font-medium">
                                        No distributors
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 ml-2 sm:gap-2 sm:ml-3">
                              {product.distributors.length > 0 ? (
                                <>
                                  <div className="flex items-center border border-gray-200 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        adjustSearchItemQuantity(product.id, -1);
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        isInteractingWithDropdownRef.current = true;
                                      }}
                                      onMouseUp={() => {
                                        setTimeout(() => {
                                          isInteractingWithDropdownRef.current = false;
                                        }, 100);
                                      }}
                                      className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors rounded-l-lg cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <input
                                      id={`quantity-${product.id}`}
                                      name={`quantity-${product.id}`}
                                      type="number"
                                      value={searchItemQuantities[product.id] || 1}
                                      onChange={(e) => setSearchItemQuantity(product.id, safeParseInt(e.target.value))}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onFocus={(e) => {
                                        e.stopPropagation();
                                        isInteractingWithDropdownRef.current = true;
                                      }}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          isInteractingWithDropdownRef.current = false;
                                        }, 100);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      min="1"
                                      className="w-10 h-6 sm:w-12 sm:h-8 text-center text-[11px] sm:text-sm font-medium border-0 focus:ring-0 focus:outline-none"
                                      aria-label={`Quantity for ${product.product_name}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        adjustSearchItemQuantity(product.id, 1);
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        isInteractingWithDropdownRef.current = true;
                                      }}
                                      onMouseUp={() => {
                                        setTimeout(() => {
                                          isInteractingWithDropdownRef.current = false;
                                        }, 100);
                                      }}
                                      className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors rounded-r-lg cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAddToCartFromSearch(product);
                                    }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      isInteractingWithDropdownRef.current = true;
                                    }}
                                    onMouseUp={() => {
                                      setTimeout(() => {
                                        isInteractingWithDropdownRef.current = false;
                                      }, 100);
                                    }}
                                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-600 text-white text-[11px] sm:text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} />
                                    Add
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-center text-gray-500 text-sm">No products found</div>
                  )}
                </div>
              )}

              {/* Empty Cart Hint Message */}
              {showEmptyCartHint && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-blue-50 border border-blue-200 rounded-lg shadow-lg z-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-blue-700 font-medium">
                      Your cart is empty. Search and add items first!
                    </p>
                  </div>
                </div>
              )}

              {/* Cart Dropdown - Same style as search results */}
              {isCartExpanded && requestCart.length > 0 && (
                <div 
                  ref={cartDropdownRef}
                  className="absolute top-full left-0 right-0 mt-0 bg-gradient-to-br from-gray-50 to-blue-50 border-0 border-b border-gray-300 shadow-lg z-50 max-h-80 overflow-hidden"
                  onMouseDown={(e) => e.preventDefault()}
                  onFocus={(e) => e.preventDefault()}
                >
                  {/* Sticky Action Buttons at Top */}
                  <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-4 py-2 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700"></span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRequestCart([]);
                            syncCartToDatabase([]);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => handleSubmitAllRequests()}
                          disabled={createBidRequestsMutation.isPending}
                          className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {createBidRequestsMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-3 h-3"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Raise Requests
                              <ArrowRight size={10} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items - Scrollable */}
                  <div className="px-4 py-3 max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {requestCart.map((item, index) => (
                        <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{item.product.product_name}</h4>
                            <p className="text-gray-500 text-xs mt-1 truncate">{item.product.manufacturer || 'Manufacturer not specified'}</p>
                            {item.product.mrp && item.product.mrp > 0 && (
                              <p className="text-gray-600 text-xs mt-1 font-medium">MRP: ₹{item.product.mrp.toFixed(2)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="w-7 h-7 flex items-center justify-center text-sm font-semibold border border-red-200 bg-white rounded-lg hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 transition-all duration-200"
                                onClick={() => adjustCartItemQuantity(index, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-2 py-1 text-xs font-medium text-gray-700 min-w-[2rem] text-center">{item.quantity}</span>
                              <button
                                className="w-7 h-7 flex items-center justify-center text-sm font-semibold border border-green-200 bg-white rounded-lg hover:bg-green-50 hover:border-green-300 text-green-600 transition-all duration-200"
                                onClick={() => adjustCartItemQuantity(index, 1)}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 hover:shadow-md rounded-lg text-sm font-semibold border border-red-200 bg-white transition-all duration-200"
                              onClick={() => {
                                setRequestCart(prevCart => {
                                  const newCart = prevCart.filter((_, i) => i !== index);
                                  syncCartToDatabase(newCart);
                                  return newCart;
                                });
                              }}
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>


        </div>

      {/* Action Buttons Section */}
      <div className="flex-shrink-0 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
                onClick={() => {
                  // Cycle through filter options
                  const filters: ('all' | 'waiting' | 'received')[] = ['all', 'waiting', 'received'];
                  const currentIndex = filters.indexOf(requestFilter);
                  const nextIndex = (currentIndex + 1) % filters.length;
                  setRequestFilter(filters[nextIndex]);
                }}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">
                  {requestFilter === 'all' ? 'All Requests' : 
                   requestFilter === 'waiting' ? 'Waiting for Bids' : 
                   'Received Bids'}
                </span>
                <span className="sm:hidden">
                  {requestFilter === 'all' ? 'All' : 
                   requestFilter === 'waiting' ? 'Waiting' : 
                   'Received'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Order All Button - Only show if there are requests with bids */}
            {requestsWithBids.length > 0 && (
              <button
                onClick={handleBulkOrder}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 cursor-pointer transition-all duration-200 rounded-lg text-sm font-medium"
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Order All ({requestsWithBids.length})</span>
                <span className="sm:hidden">Order ({requestsWithBids.length})</span>
              </button>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-all duration-200 rounded-lg"
            >
              <RefreshCw 
                size={20} 
                className={`transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Loading State */}
        {isPlacedRequestsLoading && (
          <div className="p-4 sm:p-6">
            <div className="empty-state bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="loading-spinner medium mb-4"></div>
                <p className="text-gray-600">Loading your placed requests...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isPlacedRequestsError && (
          <div className="p-4 sm:p-6">
            <div className="empty-state bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h4>
                <p className="text-red-600 text-center text-sm mb-4">
                  {placedRequestsError instanceof Error ? placedRequestsError.message : 'Could not load your placed requests. Please try again.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        {!isPlacedRequestsLoading && !isPlacedRequestsError && (
          <div className="px-2 py-3">
            {filteredRequests && filteredRequests.length > 0 ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 500px))' }}>
                {filteredRequests.map((req: any) => (
                  <RetailerBidRequestCard 
                    key={req.id} 
                    id={req.id}
                    product={req.product}
                    quantity={req.quantity}
                    bids={req.bids}
                    discountChanges={discountChanges}
                    createdAt={req.createdAt}
                    onOrderSuccess={() => setShowOrderSuccessModal(true)}
                    onCancelSuccess={() => {
                      // Just refresh the data, no modal needed
                      window.location.reload();
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Requests
                </h4>
                <p className="text-gray-600 mb-6">
                  You haven't placed any bid requests yet. Start by searching for products and creating your first request.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal removed - now handled directly in search results */}

      {/* Duplicate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDuplicateConfirmation}
        onClose={() => setShowDuplicateConfirmation(false)}
        onConfirm={handleConfirmSubmission}
        title="Replace Existing Bid Requests"
        message={`You already have active bid requests for ${duplicateItems.length} product${duplicateItems.length > 1 ? 's' : ''}. Creating new requests will replace the existing ones.`}
        confirmText="Replace & Submit"
        cancelText="Edit Cart"
        isLoading={cancelBidRequestMutation.isPending || createBidRequestsMutation.isPending}
      />

      {/* Order Success Modal */}
      <SuccessModal
        isOpen={showOrderSuccessModal}
        onClose={() => setShowOrderSuccessModal(false)}
        onConfirm={() => setShowOrderSuccessModal(false)}
        title="Order Placed Successfully!"
        message="Your order has been placed successfully. You will receive a confirmation email shortly."
        confirmText="OK"
        showOrdersButton={true}
      />

      {/* Bulk Order Modal with Pickup Point Selection */}
      {bulkOrderData && (
        <OrderModal
          isOpen={showBulkOrderModal}
          onClose={() => setShowBulkOrderModal(false)}
          onConfirm={handleConfirmBulkOrder}
          productName={`${bulkOrderData.requestCount} items from multiple requests`}
          quantity={bulkOrderData.totalItems}
          totalPrice={bulkOrderData.totalPrice}
          isLoading={createOrderMutation.isPending}
        />
      )}

    </div>
  );
}; // RetailerBidsView component