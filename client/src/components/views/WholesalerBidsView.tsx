import { useState, useMemo, useEffect, useRef, type ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetActiveRequests, useGetActiveRequestsInfinite } from "../../hooks/useBidRequests";
import { useCreateBid, useGetSubmittedBids } from "../../hooks/useBids";
import { useStats } from "../../hooks/useStats";
import { useAuthStore } from "../../stores/authStore";
import { BidRequestCard } from "./BidRequestCard";
import { ArrowLeft, RefreshCw, Package, Upload, Split } from "lucide-react";
import { useDiscountTracking } from "../../hooks/useDiscountTracking";
import { useWebSocket } from "../../hooks/useWebSocket";

// BidRequestList component (moved from separate file)
interface BidRequestListProps {
  children: ReactNode;
  className?: string;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
  };
  loading?: boolean;
  error?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  // Infinite scroll props (optional)
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  // Layout variant
  variant?: 'default' | 'split';
}

const BidRequestList = ({
  children,
  className = "",
  emptyState,
  loading = false,
  error = false,
  loadingMessage = "Loading...",
  errorMessage = "Could not load data. Please try again.",
  // Infinite scroll props
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  // Layout variant
  variant = 'default',
}: BidRequestListProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll logic (only if onLoadMore is provided)
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage && onLoadMore) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  );

  useEffect(() => {
    // Only set up intersection observer if infinite scroll is enabled
    if (!onLoadMore) return;
    
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, onLoadMore]);

  // Determine container class based on variant
  const containerClass = variant === 'split' ? 'split-view-content' : '';
  const gridClass = variant === 'split' ? 'grid gap-6 justify-center' : 'grid gap-4';

  // Loading state
  if (loading) {
    return (
      <div className={containerClass}>
        <div className="empty-state bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="loading-spinner medium mb-4"></div>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={containerClass}>
        <div className="empty-state bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <div className="flex flex-col items-center justify-center">
            <p className="text-red-600">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!children || (Array.isArray(children) && children.length === 0)) {
    if (emptyState) {
      return (
        <div className={containerClass}>
          <div className="empty-state bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl text-gray-400 mb-3">{emptyState.icon}</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{emptyState.title}</h4>
              <p className="text-gray-600 text-center text-sm">{emptyState.description}</p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }

  // Main content with grid layout
  return (
    <div className={`${containerClass} ${className}`}>
      <div className={gridClass} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 500px))' }}>
        {children}
      </div>
      
      {/* Load more trigger - only show if infinite scroll is enabled */}
      {onLoadMore && hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="loading-spinner small"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Scroll to load more</div>
          )}
        </div>
      )}
    </div>
  );
};

export const WholesalerBidsView = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: requests,
    refetch: refetchRequests,
    isError: isRequestsError,
  } = useGetActiveRequests(user?.id);
  const {
    data: infiniteRequests,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetActiveRequestsInfinite(user?.id);
  const { 
    data: submittedBidsData, 
    refetch: refetchSubmittedBids,
    isError: isSubmittedBidsError,
  } = useGetSubmittedBids();
  const { 
    data: stats, 
    isLoading: statsLoading,
    isError: isStatsError,
  } = useStats();
  const createBidMutation = useCreateBid();


  // 🔥 REAL-TIME UPDATES: WebSocket integration
  useWebSocket({
    userId: user?.id,
    userRole: true, // true = wholesaler
    onBidCreated: () => {
      queryClient.invalidateQueries({ queryKey: ['active-requests-infinite', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['submitted-bids'] });
    },
    onBidUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ['active-requests-infinite', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['submitted-bids'] });
    },
    onBidCancelled: () => {
      queryClient.invalidateQueries({ queryKey: ['active-requests-infinite', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['submitted-bids'] });
    },
    onBidRequestCreated: () => {
      queryClient.invalidateQueries({ queryKey: ['active-requests-infinite', user?.id] });
    },
    onBidRequestCancelled: () => {
      queryClient.invalidateQueries({ queryKey: ['active-requests-infinite', user?.id] });
    },
  });

  // Flatten infinite query data
  const allInfiniteRequests = useMemo(() => {
    if (!infiniteRequests?.pages) return [];
    return infiniteRequests.pages.flatMap((page: any) => page.data || []);
  }, [infiniteRequests]);

  // Track discount changes for +1 animations
  const { discountChanges } = useDiscountTracking(allInfiniteRequests);

  // State for managing bid amounts for each request
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  // State for managing MRP overrides for each request
  const [mrpOverrides, setMrpOverrides] = useState<Record<string, string>>({});
  
  // Function to get distributor's last bid MRP for a product
  const getDistributorLastBidMrp = (productId: number, distributorId: string): number | null => {
    if (!submittedBidsData || !Array.isArray(submittedBidsData)) return null;
    
    // Find the most recent bid for this product by this distributor
    const distributorBids = submittedBidsData
      .filter(bid => bid.bidRequest?.productId === productId && bid.wholesalerId === distributorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return distributorBids.length > 0 ? distributorBids[0].mrp : null;
  };

  // Handle bid again functionality
  const handleBidAgain = useCallback((bidRequestId: string, bidStatus?: 'cancelled' | 'surpassed') => {
    // Find the request in the infinite requests data
    const request = allInfiniteRequests.find((req: any) => req.id === bidRequestId);
    if (!request) return;

    // Switch back to active requests view so user can see all bids and submit new one
    setShowSubmittedBids(false);
    
    // Set the filtered request ID to show this specific request
    setFilteredRequestId(bidRequestId);
    
    // Set the bid status filter based on the bid status
    if (bidStatus === 'cancelled') {
      setBidStatusFilter('cancelled');
    } else {
      setBidStatusFilter('surpassed');
    }

    // Scroll to the top of the requests list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [allInfiniteRequests]);
  
  // State for toggling between active requests and submitted bids
  const [showSubmittedBids, setShowSubmittedBids] = useState(false);
  // State for filtering to a specific bid request
  const [filteredRequestId, setFilteredRequestId] = useState<string | null>(
    null
  );
  // State for highlighting the clicked bid request
  const [highlightedBidRequestId, setHighlightedBidRequestId] = useState<
    string | null
  >(null);
  // State for tracking filtered submitted bids count
  const [filteredSubmittedBidsCount, setFilteredSubmittedBidsCount] = useState(0);
  // State for bid status filter (cancelled vs surpassed)
  const [bidStatusFilter, setBidStatusFilter] = useState<'cancelled' | 'surpassed'>('surpassed');
  // State for split view mode
  const [isSplitView, setIsSplitView] = useState(false);
  // State for refresh button animation
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // State for submitted bids (integrated from SubmittedBidsList)
  const [submittedBidsDiscountChanges, setSubmittedBidsDiscountChanges] = useState<Record<string, boolean>>({});
  const submittedBidsPreviousDiscounts = useRef<Record<string, { bestDiscount: number | null; timestamp: number }>>({});


  // Filter requests based on specific request filter (backend now handles last bid filtering)
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(allInfiniteRequests) || !user) return [];

    // If we have a filtered request ID (from bid again), show bids based on status
    if (filteredRequestId) {
      let filteredRequests: any[] = [];
      
      if (bidStatusFilter === 'cancelled') {
        // Get all requests where user has cancelled bids
        filteredRequests = allInfiniteRequests.filter((req: any) => {
          return Array.isArray(submittedBidsData) && submittedBidsData.some(
            (bid: any) => bid.bidRequestId === req.id && bid.status === 'REJECTED'
          );
        });
      } else {
        // Get all requests where user has surpassed bids (not last bid)
        filteredRequests = allInfiniteRequests.filter((req: any) => {
          // Check if user has a bid for this request but it's not the last bid
          const currentBid = req.bids && req.bids.length > 0 ? req.bids[0] : null;
          return Array.isArray(submittedBidsData) && submittedBidsData.some(
            (bid: any) => bid.bidRequestId === req.id && !bid.isCurrentBid && currentBid && bid.status !== 'REJECTED'
          );
        });
      }

      // Sort the requests: clicked request first, then others by creation time (descending)
      const sortedRequests = filteredRequests.sort((a: any, b: any) => {
        // Put the clicked request first
        if (a.id === filteredRequestId) return -1;
        if (b.id === filteredRequestId) return 1;

        // Sort others by creation time (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      return sortedRequests;
    }

    // Return all requests (backend already filtered out requests where user has last bid)
    return requests || [];
  }, [requests, user, filteredRequestId, submittedBidsData, bidStatusFilter]);

  const handleBidAmountChange = (requestId: string, amount: string) => {
    // Prevent values greater than 99
    const numericValue = parseFloat(amount);
    if (!isNaN(numericValue) && numericValue > 99) {
      return; // Don't update if value exceeds 99
    }

    setBidAmounts((prev) => ({
      ...prev,
      [requestId]: amount,
    }));
  };

  const handleMrpChange = (requestId: string, mrp: string) => {
    setMrpOverrides((prev) => ({
      ...prev,
      [requestId]: mrp,
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Refetch both active requests and submitted bids with individual error handling
      const results = await Promise.allSettled([
        refetchRequests(),
        refetchSubmittedBids()
      ]);
      
      const errors: string[] = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operation = index === 0 ? 'active requests' : 'submitted bids';
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
      // Reset refreshing state after a short delay
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleSplitViewToggle = () => {
    setIsSplitView(!isSplitView);
    // Reset other states when entering split view
    if (!isSplitView) {
      setShowSubmittedBids(false);
      setFilteredRequestId(null);
      setHighlightedBidRequestId(null);
    }
  };

  const handleSubmitBid = (requestId: string, req: any) => {
    // Validate bidRequestId
    if (!requestId || typeof requestId !== 'string' || requestId.trim() === '') {
      console.error('Invalid bidRequestId:', requestId);
      alert("Invalid request ID");
      return;
    }

    const discount = bidAmounts[requestId];
    const mrpOverride = mrpOverrides[requestId] || req.product.mrp;

    if (
      !discount ||
      isNaN(parseFloat(discount)) ||
      parseFloat(discount) < 0 ||
      parseFloat(discount) > 100
    ) {
      alert("Please enter a valid discount percentage (0-100%)");
      return;
    }

    if (
      !mrpOverride ||
      isNaN(parseFloat(mrpOverride)) ||
      parseFloat(mrpOverride) <= 0
    ) {
      alert("Please enter a valid MRP amount");
      return;
    }

    const currentBid = req.bids && req.bids.length > 0 ? req.bids[0] : null;
    if (currentBid && parseFloat(discount) < currentBid.discountPercent) {
      return; // Validation message is now shown inline
    }

    if (!user) {
      alert("You must be logged in to submit a bid");
      return;
    }

    // Prepare payload with required fields
    const payload = {
      bidRequestId: requestId,
      discountPercent: parseFloat(discount),
      mrp: parseFloat(mrpOverride),
    };

    createBidMutation.mutate(payload, {
      onSuccess: () => {
        // Clear the discount and MRP override after successful submission
        setBidAmounts((prev) => ({
          ...prev,
          [requestId]: "",
        }));
        setMrpOverrides((prev) => ({
          ...prev,
          [requestId]: "",
        }));
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['active-requests-infinite', user.id] });
        queryClient.invalidateQueries({ queryKey: ['submitted-bids'] });
          // Bid submitted notification will be sent automatically by backend
        },
        onError: (error: any) => {
          console.error("Failed to submit bid:", error);
          // Show the specific error message from backend if available
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to submit bid. Please try again.";
          alert(errorMessage);
        },
      }
    );
  };

  // Submitted bids logic (integrated from SubmittedBidsList)
  
  // Filter out cancelled and accepted bids
  const filteredSubmittedBids = Array.isArray(submittedBidsData) ? submittedBidsData.filter((bid: any) => bid.status !== 'ACCEPTED' && bid.status !== 'REJECTED') : [];
  
  // Track discount changes for submitted bids
  useEffect(() => {
    if (!filteredSubmittedBids) return;

    const newChanges: Record<string, boolean> = {};

    filteredSubmittedBids.forEach((bid: any) => {
      const bidRequestId = bid.bidRequestId;
      const currentBid = bid.bidRequest.bids && bid.bidRequest.bids.length > 0 ? bid.bidRequest.bids[0] : null;
      const currentBestDiscount = currentBid ? currentBid.discountPercent : null;
      const previousData = submittedBidsPreviousDiscounts.current[bidRequestId];

      // Check if this is a new bid or if the best discount has changed
      if (!previousData) {
        // First time seeing this bid request - don't trigger animation
        submittedBidsPreviousDiscounts.current[bidRequestId] = {
          bestDiscount: currentBestDiscount,
          timestamp: Date.now()
        };
      } else if (
        previousData.bestDiscount !== currentBestDiscount &&
        currentBestDiscount !== null &&
        previousData.bestDiscount !== null
      ) {
        // Best discount has changed - trigger animation
        newChanges[bidRequestId] = true;
        submittedBidsPreviousDiscounts.current[bidRequestId] = {
          bestDiscount: currentBestDiscount,
          timestamp: Date.now()
        };
      } else {
        // Update the stored data without triggering animation
        submittedBidsPreviousDiscounts.current[bidRequestId] = {
          bestDiscount: currentBestDiscount,
          timestamp: Date.now()
        };
      }
    });

    // Set the changes and clear them after a short delay
    if (Object.keys(newChanges).length > 0) {
      setSubmittedBidsDiscountChanges(newChanges);
      
      // Clear the changes after animation duration
      setTimeout(() => {
        setSubmittedBidsDiscountChanges({});
      }, 2000);
    }
  }, [filteredSubmittedBids]);

  // Update filtered submitted bids count
  useEffect(() => {
    setFilteredSubmittedBidsCount(filteredSubmittedBids.length);
  }, [filteredSubmittedBids.length]);


  if (isInfiniteLoading || statsLoading) {
    return (
      <div className="wholesaler-bids-view">
        <div className="loading-state">
          <div className="loading-spinner medium"></div>
          <p className="text-gray-600">Loading active bid requests...</p>
        </div>
      </div>
    );
  }

  // Check if distributor has no inventory
  const hasInventory = stats?.activeProducts > 0;
  

  if (isInfiniteError) {
    return (
      <div className="wholesaler-bids-view">
        <div className="error-state">
          <p className="text-red-600">
            Could not load active requests. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Show inventory prompt if no inventory, but still show submitted bids
  if (!hasInventory) {
    return (
      <div className="wholesaler-bids-view">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Active Requests
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                No inventory available
              </p>
            </div>
          </div>
        </div>

        {/* No Inventory Message */}
        <div className="p-4 sm:p-6">
          <div className="empty-state bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No Inventory Found
              </h4>
              <p className="text-gray-600 text-center text-sm mb-6 max-w-md">
                You need to add inventory to your account before you can see bid
                requests. Only products that match your inventory will show
                available requests.
              </p>
              <button
                onClick={() => {
                  // Navigate to inventory using React Router
                  navigate('/app/inventory');
                }}
                className="btn-primary flex items-center space-x-2 px-6 py-3 cursor-pointer"
              >
                <Upload size={20} />
                <span>Add Inventory</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submitted Bids Section - Show even without inventory */}
        <div className="p-4 sm:p-6">
          <BidRequestList
            loading={false}
            error={isSubmittedBidsError}
            loadingMessage="Loading your submitted bids..."
            errorMessage="Could not load your submitted bids. Please try again."
            emptyState={{
              icon: "⚖️",
              title: "No Bids Submitted",
              description: "You haven't submitted any bids yet. Review active requests above and submit your competitive offers."
            }}
          >
            {filteredSubmittedBids.map((bid: any) => (
              <BidRequestCard
                key={bid.id}
                id={bid.bidRequestId}
                product={bid.bidRequest?.product || {}}
                quantity={bid.bidRequest?.quantity || 0}
                bids={bid.bidRequest?.bids || []}
                discountChanges={submittedBidsDiscountChanges}
                createdAt={bid.bidRequest?.createdAt || bid.createdAt}
                type="submitted"
                submittedBid={{
                  id: bid.id,
                  discountPercent: bid.discountPercent,
                  finalPrice: bid.finalPrice,
                  mrp: bid.mrp,
                  iscurrentBid: bid.isCurrentBid,
                  status: bid.status,
                  createdAt: bid.createdAt,
                  canCancel: bid.canCancel,
                }}
                distributorLastBidMrp={getDistributorLastBidMrp(bid.bidRequest?.product?.id, user?.id || '')}
                onBidAgain={handleBidAgain}
              />
            ))}
          </BidRequestList>
        </div>
      </div>
    );
  }

  return (
    <div className="wholesaler-bids-view h-full flex flex-col overflow-hidden p-2">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white rounded-lg">
        <div className="flex items-center justify-between px-3 sm:px-4">
          <div>
            <p className="text-sm text-gray-500 mt-1">
              {isSplitView ? (
                <i>
                  {Array.isArray(filteredRequests) ? filteredRequests.length : 0} request
                  {Array.isArray(filteredRequests) && filteredRequests.length !== 1 ? "s" : ""} available /{" "}
                  {filteredSubmittedBidsCount} bid
                  {filteredSubmittedBidsCount !== 1 ? "s" : ""} submitted
                </i>
              ) : showSubmittedBids ? (
                <i>
                  {filteredSubmittedBidsCount} bid
                  {filteredSubmittedBidsCount !== 1 ? "s" : ""} submitted
                </i>
              ) : (
                <i>
                  {filteredRequestId ? (
                    <i>
                      Showing specific request
                      {Array.isArray(filteredRequests) && filteredRequests.length === 0 && (
                        <span className="text-red-600 ml-2">()</span>
                      )}
                    </i>
                  ) : (
                    <i>
                      {Array.isArray(filteredRequests) ? filteredRequests.length : 0} request
                      {Array.isArray(filteredRequests) && filteredRequests.length !== 1 ? "s" : ""} available
                    </i>
                  )}
                </i>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Main toggle between active requests and submitted bids - Hidden in split view */}
            {!isSplitView && (
              <div className="relative">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setShowSubmittedBids(false)}
                    className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                      !showSubmittedBids
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="View Active Requests"
                  >
                    <span className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${!showSubmittedBids ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      Active
                    </span>
                  </button>
                  <button
                    onClick={() => setShowSubmittedBids(true)}
                    className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                      showSubmittedBids
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="View Submitted Bids"
                  >
                    <span className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${showSubmittedBids ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                      Submitted
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Split View Button - Only visible on large screens and above */}
            <button
              onClick={handleSplitViewToggle}
              className={`hidden lg:flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-200 rounded-lg ${
                isSplitView
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Split size={20} />
            </button>

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

      {/* Error Display */}
      {(error || isRequestsError || isInfiniteError || isSubmittedBidsError || isStatsError) && (
        <div className="flex-shrink-0 mt-2 mx-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700">
                  {error || 
                   (isRequestsError && 'Failed to load active requests') ||
                   (isInfiniteError && 'Failed to load request data') ||
                   (isSubmittedBidsError && 'Failed to load submitted bids') ||
                   (isStatsError && 'Failed to load statistics') ||
                   'An error occurred'}
                </p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto min-h-0 mt-2">
        {/* Show back button when filtering to specific request */}
        {filteredRequestId && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  setFilteredRequestId(null);
                  setHighlightedBidRequestId(null);
                  setBidStatusFilter('surpassed');
                }}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back <strong>Showing {bidStatusFilter} bids</strong>
              </button>
            </div>
          </div>
        )}

        {/* Conditional rendering based on split view or toggle state */}
        {isSplitView ? (
          <>
            {/* Mobile fallback message */}
            <div className="lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">ℹ️</span>
                <span className="text-sm font-medium text-blue-800">
                  Split view is only available on large screens and above
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Please use a larger screen or switch to single view mode.
              </p>
            </div>

            {/* Split view for large screens */}
            <div className="hidden lg:block">
              <div className="split-view-container-resizable">
                {/* Active Requests Half */}
                <div className="split-view-panel flex-1">
                  <BidRequestList
                    variant="split"
                    emptyState={{
                      icon: "📦",
                      title: "No Active Bid Requests",
                      description: "There are currently no active bid requests available. Check back later for new opportunities."
                    }}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onLoadMore={() => fetchNextPage()}
                  >
                    {Array.isArray(filteredRequests) && filteredRequests.map((req: any) => {
                      // Check if user has the last bid for this request
                      const userHascurrentBid =
                        req.bids &&
                        req.bids.length > 0 &&
                        req.bids.reduce((last: any, current: any) => {
                          return current.discountPercent > last.discountPercent
                            ? current
                            : last;
                        }).wholesalerId === user?.id;

                      return (
                        <BidRequestCard
                          key={req.id}
                          id={req.id}
                          product={req.product}
                          quantity={req.quantity}
                          bids={req.bids}
                          discountChanges={discountChanges}
                          highlightedBidRequestId={highlightedBidRequestId}
                          userHascurrentBid={userHascurrentBid}
                          createdAt={req.createdAt}
                          type="active"
                          bidAmounts={bidAmounts}
                          mrpOverrides={mrpOverrides}
                          createBidMutation={createBidMutation}
                          onBidAmountChange={handleBidAmountChange}
                          onMrpChange={handleMrpChange}
                          onSubmitBid={handleSubmitBid}
                        />
                      );
                    })}
                  </BidRequestList>
                </div>

                {/* Submitted Bids Half */}
                <div className="split-view-panel flex-1">
                  <BidRequestList
                    variant="split"
                    loading={false}
                    error={isSubmittedBidsError}
                    loadingMessage="Loading your submitted bids..."
                    errorMessage="Could not load your submitted bids. Please try again."
                    emptyState={{
                      icon: "⚖️",
                      title: "No Bids Submitted",
                      description: "You haven't submitted any bids yet. Review active requests above and submit your competitive offers."
                    }}
                  >
                    {filteredSubmittedBids.map((bid: any) => (
                      <BidRequestCard
                        key={bid.id}
                        id={bid.bidRequestId}
                        product={bid.bidRequest?.product || {}}
                        quantity={bid.bidRequest?.quantity || 0}
                        bids={bid.bidRequest?.bids || []}
                        discountChanges={submittedBidsDiscountChanges}
                        createdAt={bid.bidRequest?.createdAt || bid.createdAt}
                        type="submitted"
                        submittedBid={{
                          id: bid.id,
                          discountPercent: bid.discountPercent,
                          finalPrice: bid.finalPrice,
                          mrp: bid.mrp,
                          iscurrentBid: bid.isCurrentBid,
                          status: bid.status,
                          createdAt: bid.createdAt,
                          canCancel: bid.canCancel,
                        }}
                        distributorLastBidMrp={getDistributorLastBidMrp(bid.bidRequest?.product?.id, user?.id || '')}
                      />
                    ))}
                  </BidRequestList>
                </div>
              </div>
            </div>

            {/* Mobile fallback - show active requests */}
            <div className="lg:hidden">
              {showSubmittedBids ? (
                <BidRequestList
                  loading={false}
                  error={isSubmittedBidsError}
                  loadingMessage="Loading your submitted bids..."
                  errorMessage="Could not load your submitted bids. Please try again."
                  emptyState={{
                    icon: "⚖️",
                    title: "No Bids Submitted",
                    description: "You haven't submitted any bids yet. Review active requests above and submit your competitive offers."
                  }}
                >
                  {filteredSubmittedBids.map((bid: any) => (
                    <BidRequestCard
                      key={bid.id}
                      id={bid.bidRequestId}
                      product={bid.bidRequest?.product || {}}
                      quantity={bid.bidRequest?.quantity || 0}
                      bids={bid.bidRequest?.bids || []}
                      discountChanges={submittedBidsDiscountChanges}
                      createdAt={bid.bidRequest?.createdAt || bid.createdAt}
                      type="submitted"
                      submittedBid={{
                        id: bid.id,
                        discountPercent: bid.discountPercent,
                        finalPrice: bid.finalPrice,
                        mrp: bid.mrp,
                        iscurrentBid: bid.isCurrentBid,
                        status: bid.status,
                        createdAt: bid.createdAt,
                        canCancel: bid.canCancel,
                      }}
                      distributorLastBidMrp={getDistributorLastBidMrp(bid.bidRequest?.product?.id, user?.id || '')}
                    />
                  ))}
                </BidRequestList>
              ) : (
                <>
                  <BidRequestList
                    emptyState={{
                      icon: "📦",
                      title: "No Active Bid Requests",
                      description:
                        "There are currently no active bid requests available. Check back later for new opportunities.",
                    }}
                    loading={isInfiniteLoading}
                    error={isInfiniteError}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onLoadMore={() => fetchNextPage()}
                  >
                    {Array.isArray(filteredRequests) && filteredRequests.map((req: any) => {
                      // Check if user has the last bid for this request
                      const userHascurrentBid =
                        req.bids &&
                        req.bids.length > 0 &&
                        req.bids.reduce((last: any, current: any) => {
                          return current.discountPercent > last.discountPercent
                            ? current
                            : last;
                        }).wholesalerId === user?.id;

                      return (
                        <BidRequestCard
                          key={req.id}
                          id={req.id}
                          product={req.product}
                          quantity={req.quantity}
                          bids={req.bids}
                          discountChanges={discountChanges}
                          highlightedBidRequestId={highlightedBidRequestId}
                          userHascurrentBid={userHascurrentBid}
                          createdAt={req.createdAt}
                          type="active"
                          bidAmounts={bidAmounts}
                          mrpOverrides={mrpOverrides}
                          createBidMutation={createBidMutation}
                          onBidAmountChange={handleBidAmountChange}
                          onMrpChange={handleMrpChange}
                          onSubmitBid={handleSubmitBid}
                        />
                      );
                    })}
                  </BidRequestList>
                </>
              )}
            </div>
          </>
        ) : showSubmittedBids ? (
          <BidRequestList
            loading={false}
            error={isSubmittedBidsError}
            loadingMessage="Loading your submitted bids..."
            errorMessage="Could not load your submitted bids. Please try again."
            emptyState={{
              icon: "⚖️",
              title: "No Bids Submitted",
              description: "You haven't submitted any bids yet. Review active requests above and submit your competitive offers."
            }}
          >
            {filteredSubmittedBids.map((bid: any) => (
              <BidRequestCard
                key={bid.id}
                id={bid.bidRequestId}
                product={bid.bidRequest?.product || {}}
                quantity={bid.bidRequest?.quantity || 0}
                bids={bid.bidRequest?.bids || []}
                discountChanges={submittedBidsDiscountChanges}
                createdAt={bid.bidRequest?.createdAt || bid.createdAt}
                type="submitted"
                submittedBid={{
                  id: bid.id,
                  discountPercent: bid.discountPercent,
                  finalPrice: bid.finalPrice,
                  mrp: bid.mrp,
                  iscurrentBid: bid.isCurrentBid,
                  status: bid.status,
                  createdAt: bid.createdAt,
                  canCancel: bid.canCancel,
                }}
                distributorLastBidMrp={getDistributorLastBidMrp(bid.bidRequest?.product?.id, user?.id || '')}
                onBidAgain={handleBidAgain}
              />
            ))}
          </BidRequestList>
        ) : (
          <>
            <BidRequestList
              emptyState={{
                icon: "📦",
                title: "No Active Bid Requests",
                description:
                  "There are currently no active bid requests available. Check back later for new opportunities.",
              }}
              loading={isInfiniteLoading}
              error={isInfiniteError}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
            >
              {Array.isArray(filteredRequests) && filteredRequests.map((req: any) => {
                // Check if user has the last bid for this request
                const userHascurrentBid =
                  req.bids &&
                  req.bids.length > 0 &&
                  req.bids.reduce((last: any, current: any) => {
                    return current.discountPercent > last.discountPercent
                      ? current
                      : last;
                  }).wholesalerId === user?.id;

                return (
                  <BidRequestCard
                    key={req.id}
                    id={req.id}
                    product={req.product}
                    quantity={req.quantity}
                    bids={req.bids}
                    discountChanges={discountChanges}
                    highlightedBidRequestId={highlightedBidRequestId}
                    userHascurrentBid={userHascurrentBid}
                    createdAt={req.createdAt}
                    type="active"
                    bidAmounts={bidAmounts}
                    mrpOverrides={mrpOverrides}
                    createBidMutation={createBidMutation}
                    onBidAmountChange={handleBidAmountChange}
                    onMrpChange={handleMrpChange}
                    onSubmitBid={handleSubmitBid}
                    distributorLastBidMrp={getDistributorLastBidMrp(req.product.id, user?.id || '')}
                  />
                );
              })}
            </BidRequestList>
          </>
        )}
      </div>
    </div>
  );
};
