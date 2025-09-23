import { useState } from 'react';
import { Send } from 'lucide-react';
import { PlusOneAnimation } from '../common/PlusOneAnimation';

interface BidRequestCardProps {
  // Common props
  id: string;
  product: {
    manufacturer?: string;
    product_name: string;
    mrp: number;
  };
  quantity: number;
  bids?: any[];
  discountChanges?: Record<string, boolean>;
  highlightedBidRequestId?: string | null;
  userHascurrentBid?: boolean;
  createdAt: string; // Common timestamp for both active and submitted
  
  // Type-specific props
  type: 'active' | 'submitted' | 'retailer';
  
  // Active request props
  bidAmounts?: Record<string, string>;
  mrpOverrides?: Record<string, string>;
  createBidMutation?: any;
  onBidAmountChange?: (requestId: string, amount: string) => void;
  onMrpChange?: (requestId: string, mrp: string) => void;
  onSubmitBid?: (requestId: string, req: any) => void;
  distributorLastBidMrp?: number | null; // MRP from distributor's last bid for this product
  
  // Submitted bid props
  submittedBid?: {
    id: string;
    discountPercent: number;
    finalPrice: number;
    mrp: number;
    iscurrentBid: boolean;
    status: string;
    createdAt: string;
    canCancel?: boolean;
  };
  onBidAgain?: (bidRequestId: string, bidStatus?: 'cancelled' | 'surpassed') => void;
  
  // Custom content for retailer view
  customContent?: React.ReactNode;
}

export const BidRequestCard = ({
  id,
  product,
  quantity,
  bids = [],
  discountChanges = {},
  highlightedBidRequestId,
  userHascurrentBid = false,
  createdAt,
  type,
  bidAmounts = {},
  mrpOverrides = {},
  createBidMutation,
  onBidAmountChange,
  onMrpChange,
  onSubmitBid,
  submittedBid,
  onBidAgain,
  customContent,
  distributorLastBidMrp,
}: BidRequestCardProps) => {
  const [localBidAmount, setLocalBidAmount] = useState(bidAmounts[id] || '');
  const [localMrpOverride, setLocalMrpOverride] = useState(() => {
    // Priority: 1. User's current input, 2. Distributor's last bid MRP, 3. Product MRP
    if (mrpOverrides[id] !== undefined) {
      return mrpOverrides[id];
    }
    if (distributorLastBidMrp !== null && distributorLastBidMrp !== undefined) {
      return distributorLastBidMrp.toString();
    }
    return product.mrp?.toString() || '';
  });

  const handleBidAmountChange = (amount: string) => {
    setLocalBidAmount(amount);
    onBidAmountChange?.(id, amount);
  };

  const handleMrpChange = (mrp: string) => {
    setLocalMrpOverride(mrp);
    onMrpChange?.(id, mrp);
  };

  const handleSubmitBid = () => {
    if (onSubmitBid) {
      onSubmitBid(id, { id, product, quantity, bids });
    }
  };


  // Get status info for submitted bids
  const getStatusInfo = (status: string, iscurrentBid: boolean) => {
    if (!iscurrentBid && bids.length > 0) {
      return {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        badgeColor: 'bg-orange-100',
        icon: '⚠️',
        label: 'Surpassed'
      };
    }

    switch (status?.toLowerCase()) {
      case 'accepted':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          badgeColor: 'bg-green-100',
          icon: '✓',
          label: 'Accepted'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          badgeColor: 'bg-red-100',
          icon: '✗',
          label: 'Rejected'
        };
      case 'pending':
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-100',
          icon: '⏳',
          label: 'Pending'
        };
    }
  };

  const statusInfo = submittedBid ? getStatusInfo(submittedBid.status, submittedBid.iscurrentBid) : null;
  const currentBid = bids.length > 0 ? bids[0] : null;

  return (
    <div className="relative">
      {/* Bid Again Target Badge - Floating overlay */}
      {highlightedBidRequestId === id && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-30">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white shadow-lg border-2 border-white">
            Bid Again
          </span>
        </div>
      )}
      
      <div
        className={`relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 w-full flex flex-col ${
          highlightedBidRequestId === id
            ? "bg-blue-50 border-blue-200 shadow-md"
            : userHascurrentBid
            ? "bg-green-50"
            : ""
        } ${statusInfo ? `${statusInfo.bgColor} ${statusInfo.borderColor}` : ''} ${
          createBidMutation?.isPending ? 'opacity-75 pointer-events-none' : ''
        }`}
      >
        {/* Processing Overlay */}
        {createBidMutation?.isPending && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium">Submitting bid...</span>
            </div>
          </div>
        )}
      {/* +1 Animation for discount changes */}
      <PlusOneAnimation 
        trigger={discountChanges[id] || false}
        position="top-right"
        size="small"
        color={type === 'active' ? 'green' : 'orange'}
      />
      
      
      {/* Product Information Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Product Info, Qty, and Bid Status - All in one horizontal line */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          {/* Product Info - Left aligned */}
          <div className="flex-1 min-w-0">
            {/* Manufacturer - Small font */}
            <div className="text-xs text-gray-500 mb-1">
              {product.manufacturer || "Manufacturer not specified"}
            </div>
            {/* Product Name */}
            <h3 className="product-name font-semibold text-gray-900 text-base sm:text-xl mb-2">
              {product.product_name}
            </h3>
            {/* Status badges */}
            <div className="flex items-center gap-2">
              {userHascurrentBid && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  You're Winning
                </span>
              )}
            </div>
          </div>
          
          {/* Qty - Center */}
          <div className="flex-shrink-0 mx-4">
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1.5 rounded-lg">
              Qty: {quantity}
            </span>
          </div>
          
          {/* Current Bid - Right aligned */}
          <div className="flex-shrink-0">
            {currentBid ? (
              <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg">
                Current Bid: <strong>{currentBid.discountPercent.toFixed(1)}%</strong>
              </span>
            ) : (
              <span className="text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg">
                No bids yet
              </span>
            )}
          </div>
        </div>

        {/* Type-specific content */}
        {customContent ? (
          customContent
        ) : type === 'active' || type === 'retailer' ? (
          /* Active Request - Bid Form Section */
          <div className="bg-gray-50 p-4">
            <div className="flex items-end gap-2">
              {/* Discount Input */}
              <div className="flex-1">
                <label htmlFor={`discount-${id}`} className="block text-xs font-medium text-gray-700 mb-1">
                  Discount %
                </label>
                <div className="relative">
                  <input
                    id={`discount-${id}`}
                    name={`discount-${id}`}
                    type="number"
                    placeholder={
                      currentBid
                        ? `${currentBid.discountPercent.toFixed(1)}+`
                        : "0"
                    }
                    value={localBidAmount}
                    onChange={(e) => handleBidAmountChange(e.target.value)}
                    min={
                      currentBid
                        ? (currentBid.discountPercent + 0.1).toString()
                        : "0"
                    }
                    max="99"
                    step="0.1"
                    className="form-input text-center pr-6 text-sm py-2"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                    %
                  </span>
                </div>
              </div>

              {/* MRP Input */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={`mrp-${id}`} className="text-xs font-medium text-gray-700">
                    MRP
                  </label>
                  {/* Unit Price Display */}
                  {localBidAmount &&
                    !isNaN(parseFloat(localBidAmount)) &&
                    localMrpOverride &&
                    localMrpOverride !== "" &&
                    !isNaN(parseFloat(localMrpOverride)) &&
                    parseFloat(localMrpOverride) > 0 && (
                      <span className="text-[10px] text-gray-500">
                        Bid Price: ₹{(() => {
                          const mrp = parseFloat(localMrpOverride);
                          const discount = parseFloat(localBidAmount);
                          return (mrp * (1 - discount / 100)).toFixed(2);
                        })()}
                      </span>
                    )}
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                    ₹
                  </span>
                  <input
                    id={`mrp-${id}`}
                    name={`mrp-${id}`}
                    type="number"
                    placeholder="0"
                    value={localMrpOverride}
                    onChange={(e) => handleMrpChange(e.target.value)}
                    onBlur={(e) => {
                      // If field is empty on blur, restore fallback to product MRP
                      if (e.target.value === "" && product.mrp) {
                        handleMrpChange(product.mrp.toString());
                      }
                    }}
                    min="0"
                    step="0.01"
                    className="form-input text-center pl-5 pr-2 text-sm py-2"
                  />
                </div>
              </div>

              {/* Submit Button - Tiny Icon */}
              <div className="flex-shrink-0">
                <div className="block text-xs font-medium text-gray-700 mb-1">
                  &nbsp;
                </div>
                <button
                  onClick={handleSubmitBid}
                  disabled={
                    createBidMutation?.isPending ||
                    !localBidAmount ||
                    !localMrpOverride ||
                    localMrpOverride === "" ||
                    isNaN(parseFloat(localMrpOverride)) ||
                    parseFloat(localMrpOverride) <= 0 ||
                    (currentBid && parseFloat(localBidAmount) <= currentBid.discountPercent)
                  }
                  className={`p-2 h-10 w-10 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    createBidMutation?.isPending 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'btn-primary hover:bg-blue-600'
                  }`}
                  title={createBidMutation?.isPending ? "Submitting..." : "Submit Bid"}
                >
                  {createBidMutation?.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Submitted Bid - Preview and Status Section */
          <>
            {/* Compact bid details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Unit: ₹{submittedBid?.finalPrice?.toFixed(2) || '0.00'}
                </span>
                <span className="text-gray-600">
                  MRP: ₹{(() => {
                    // If there's a current active bid, use its MRP
                    if (currentBid && currentBid.mrp) {
                      return currentBid.mrp.toFixed(2);
                    }
                    // Otherwise, use the original product MRP
                    return product.mrp?.toFixed(2) || '0.00';
                  })()}
                </span>
              </div>
            </div>
            {/* Non-surpassed bid notification (user's bid is still the best) */}
            {submittedBid && submittedBid.iscurrentBid && submittedBid.status !== 'REJECTED' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 h-12">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xs">✓</span>
                    <span className="text-xs font-medium text-green-800">
                      Your Bid: <strong>{submittedBid.discountPercent.toFixed(1)}%</strong> (Current)
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* Cancelled bid notification and bid again button */}
            {submittedBid && submittedBid.status === 'REJECTED' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 h-12">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">✕</span>
                    <span className="text-xs font-medium text-gray-600">
                      Your bid has been cancelled
                    </span>
                  </div>
                  <button
                    onClick={() => onBidAgain?.(id, 'cancelled')}
                    className="px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                  >
                    Bid Again
                  </button>
                </div>
              </div>
            )}
            {/* Surpassed bid notification and bid again button */}
            {submittedBid && !submittedBid.iscurrentBid && currentBid && submittedBid.status !== 'REJECTED' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2 h-12">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 text-xs">⚠️</span>
                    <span className="text-xs font-medium text-orange-800">
                      Your Bid: <strong>{submittedBid.discountPercent.toFixed(1)}%</strong> → Current Bid: <strong>{currentBid.discountPercent.toFixed(1)}%</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onBidAgain?.(id, 'surpassed')}
                      className="px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                    >
                      Bid Again
                    </button>
                    {/* COMMENTED OUT: Cancel bid menu */}
                    {/* <div className="relative" data-menu-container>
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        title="More options"
                        className={`
                          p-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1
                          ${showMenu 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }
                        `}
                      >
                        <MoreVertical size={12} />
                      </button>
                      
                      {showMenu && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 min-w-[120px]">
                          <button
                            onClick={handleCancelBid}
                            disabled={!submittedBid?.canCancel}
                            className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-1 ${
                              submittedBid?.canCancel
                                ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <span className={submittedBid?.canCancel ? 'text-red-500' : 'text-gray-400'}>✕</span>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>
            )}

            

          </>
        )}
        
        {/* Footer with timestamp - common for both types */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 px-4 pb-2">
          <div className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
