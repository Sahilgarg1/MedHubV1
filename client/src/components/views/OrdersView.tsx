import { useState, useEffect, useRef } from 'react';
import { useGetOrders } from '../../hooks/useOrders';
import { usePrimarySupportContact } from '../../hooks/useSupportContacts';
import { useMarginByClass } from '../../hooks/useMargins';
import { useAuthStore } from '../../stores/authStore';
import { Package, ChevronDown, ChevronUp, Phone, TrendingDown, AlertCircle, MapPin, Filter, Users, X, ChevronRight } from 'lucide-react';
import { formatDiscount, calculateRetailerDiscount } from '../../utils/discountUtils';
import { useAccordion, AccordionProvider } from '../../contexts/AccordionContext';

// OrderBucketPreview component for split view
const OrderBucketPreview = ({ bucket, onClose }: { bucket: any; onClose: () => void }) => {
  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col max-h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Users size={20} className="text-primary" />
          <h3 className="font-semibold text-gray-900">
            Order from {bucket.retailer?.businessName || 'Retailer'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{bucket.totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-green-600">₹{Number(bucket.totalPrice || 0).toFixed(2)}</span>
              </div>
              {bucket.retailer?.gstNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">GSTIN:</span>
                  <span className="font-medium">{bucket.retailer.gstNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Individual Orders */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Order Details</h4>
            {bucket.orders.map((order: any) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 block mb-1">
                      {order.product.product_name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {order.product.manufacturer}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      ₹{Number(order.totalPrice || 0).toFixed(2)}
                    </span>
                    <div className="text-sm text-gray-600">
                      Qty: {order.quantity}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      MRP: ₹{Number(order.mrp || 0).toFixed(2)}
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatDiscount(order.discountPercent)}% off
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {order.product.batch && (
                      <span>Batch: {order.product.batch}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact OrderBucketItem with preview button
const OrderBucketItem = ({ bucket, onSelect, isSelected }: { bucket: any; onSelect?: () => void; isSelected?: boolean }) => {
  const { data: primaryContact } = usePrimarySupportContact();
  
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleContactUs = () => {
    if (primaryContact?.phone) {
      window.open(`tel:${primaryContact.phone}`, '_self');
    } else {
      alert('Contact information is not available. Please try again later.');
    }
  };

  return (
    <div className={`order-item ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-150" 
        onClick={handleClick}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Users size={16} className="text-primary flex-shrink-0" />
            <span className="order-product font-medium text-gray-900 truncate text-sm">
              {bucket.retailer?.businessName || 'Retailer'}
            </span>
            {bucket.retailer?.gstNumber && (
              <span className="text-gray-600 text-xs truncate max-w-[120px]">GST: {bucket.retailer.gstNumber}</span>
            )}
          </div>
          <div className="order-meta flex items-center gap-3 text-xs text-gray-600">
            <span>{bucket.totalItems} items</span>
            <span className="font-medium text-green-600">₹{Number(bucket.totalPrice || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3 flex items-center space-x-1">
          <button 
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleContactUs();
            }}
            title="Contact Support"
          >
            <Phone size={16} />
          </button>
          <button 
            className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({ order, isRetailer }: { order: any; isRetailer: boolean }) => {
  const { expandedItem, toggleExpanded } = useAccordion();
  const { data: primaryContact } = usePrimarySupportContact();
  
  const itemId = `order-${order.id}`;
  const isExpanded = expandedItem === itemId;
  
  // Calculate margin-adjusted discount for retailers
  const productClass = order.product?.class || 'D';
  const marginValue = useMarginByClass(productClass);
  const originalDiscount = order.bid?.discountPercent || order.discountPercent || 0;
  const retailerDiscount = isRetailer 
    ? calculateRetailerDiscount(originalDiscount, productClass, marginValue)
    : originalDiscount;

  const handleContactUs = () => {
    if (primaryContact?.phone) {
      window.open(`tel:${primaryContact.phone}`, '_self');
    } else {
      alert('Contact information is not available. Please try again later.');
    }
  };


  return (
    <div className="order-item">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150" 
        onClick={() => toggleExpanded(itemId)}
      >
        <div className="flex-1">
          <span className="order-product block font-medium text-gray-900 mb-2">{order.product.product_name}</span>
          <div className="order-meta flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Package size={14} />
              Qty: {order.quantity}
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <TrendingDown size={14} />
              {formatDiscount(retailerDiscount)}
            </span>
            {order.bid?.mrp && order.bid.mrp > 0 && (
              <span>MRP: ₹{Number(order.bid?.mrp || 0).toFixed(2)}</span>
            )}
            {order.pickupPoint && (
              <span className="flex items-center gap-1 text-primary">
                <MapPin size={14} />
                {order.pickupPoint || 'Default Pickup Point'}
              </span>
            )}
            <span className="text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            <button onClick={handleContactUs} className="btn-outline btn-sm flex items-center space-x-2">
              <Phone size={16} />
              <span>Raise Ticket</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const OrdersView = () => {
  const { user } = useAuthStore();
  const { data: orders, isLoading, isError, error, refetch } = useGetOrders();
  
  // State for error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State for date filtering (integrated from OrdersFilter)
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // State for split view (large screens)
  const [selectedBucket, setSelectedBucket] = useState<any>(null);

  const isRetailer = !user?.isWholesaler;
  
  
  // Handle errors
  useEffect(() => {
    if (isError && error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load orders';
      setErrorMessage(errorMsg);
    } else {
      setErrorMessage(null);
    }
  }, [isError, error]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter handlers
  const handleFilterSelect = (value: string) => {
    setDateFilter(value);
    if (value !== 'custom') {
      setIsFilterOpen(false);
    }
  };

  // Date filter options
  const dateFilterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last3days', label: 'Last 3 Days' },
    { value: 'lastweek', label: 'Last Week' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Date' },
    { value: 'all', label: 'All Time' }
  ];

  // Get date range based on filter option
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      case 'last3days':
        const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
        return { start: threeDaysAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'lastweek':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'lastmonth':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: monthAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'custom':
        if (!customDate) return null;
        const custom = new Date(customDate);
        const customStart = new Date(custom.getFullYear(), custom.getMonth(), custom.getDate());
        const customEnd = new Date(customStart.getTime() + 24 * 60 * 60 * 1000);
        return { start: customStart, end: customEnd };
      default:
        return null;
    }
  };

  // Filter orders by date - ensure orders is an array
  const filteredOrders = Array.isArray(orders) ? orders.filter((order: any) => {
    if (dateFilter === 'all') return true;
    
    const dateRange = getDateRange(dateFilter);
    if (!dateRange) return true;
    
    const orderDate = new Date(order.createdAt);
    return orderDate >= dateRange.start && orderDate < dateRange.end;
  }) : [];

  if (isLoading) {
    return (
      <div className="orders-view">
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="orders-view">
        <div className="error-state">
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-red-600 text-center text-sm mb-4">
              {errorMessage || 'Error fetching orders. Please try again later.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccordionProvider>
      <div className="orders-view h-full flex flex-col overflow-hidden">
        {/* Filter Section */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              <span className="text-sm text-gray-500">({filteredOrders.length})</span>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white border border-gray-200 shadow-sm"
              >
                <Filter size={16} className="text-gray-500" />
                <span>{dateFilterOptions.find(option => option.value === dateFilter)?.label || 'Filter'}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {dateFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterSelect(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          dateFilter === option.value ? 'bg-primary-50 text-primary' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Date Input */}
                  {dateFilter === 'custom' && (
                    <div className="border-t border-gray-200 p-3">
                      <label htmlFor="custom-date-input" className="block text-xs font-medium text-gray-700 mb-1">
                        Select Date
                      </label>
                      <input
                        id="custom-date-input"
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="flex-1 flex overflow-hidden">
            {isRetailer ? (
              // For retailers, show individual orders in single column
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-4">
                  {filteredOrders.map((order: any) => (
                    <OrderItem 
                      key={order.id} 
                      order={order} 
                      isRetailer={isRetailer}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // For wholesalers, show split view on large screens
              <>
                {/* Left side - Order buckets list */}
                <div className={`${selectedBucket ? 'w-full xl:w-1/2' : 'w-full'} overflow-y-auto px-4 py-6 transition-all duration-300`}>
                  <div className="space-y-4">
                    {filteredOrders.map((bucket: any) => (
                      <OrderBucketItem 
                        key={bucket.id} 
                        bucket={bucket} 
                        onSelect={() => setSelectedBucket(bucket)}
                        isSelected={selectedBucket?.id === bucket.id}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Right side - Order preview (only on large screens) */}
                {selectedBucket && (
                  <div className="w-1/2 hidden xl:block">
                    <OrderBucketPreview 
                      bucket={selectedBucket} 
                      onClose={() => setSelectedBucket(null)} 
                    />
                  </div>
                )}
                
                {/* Mobile/Tablet preview overlay */}
                {selectedBucket && (
                  <div className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                      <OrderBucketPreview 
                        bucket={selectedBucket} 
                        onClose={() => setSelectedBucket(null)} 
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto empty-state px-4 py-12">
            <div className="empty-icon">
              <Package size={64} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {dateFilter !== 'all' ? 'No Orders Found' : 'No Orders Yet'}
            </h3>
            <p className="text-gray-600 max-w-md">
              {dateFilter !== 'all' 
                ? `No orders found for ${dateFilterOptions.find(opt => opt.value === dateFilter)?.label.toLowerCase()}. Try selecting a different time period.`
                : isRetailer 
                  ? "You haven't placed any orders yet. Browse products and submit bid requests to get started."
                  : "You don't have any orders to fulfill yet. Respond to bid requests to start receiving orders."
              }
            </p>
            {dateFilter !== 'all' && (
              <button
                onClick={() => setDateFilter('all')}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Show All Orders
              </button>
            )}
          </div>
        )}
      </div>
    </AccordionProvider>
  );
};