import { useState, useEffect, useRef } from 'react';

interface DiscountData {
  id: string;
  bestDiscount: number | null;
  timestamp: number;
}

export const useDiscountTracking = (requests: any[]) => {
  const [discountChanges, setDiscountChanges] = useState<Record<string, boolean>>({});
  const previousDiscounts = useRef<Record<string, DiscountData>>({});

  useEffect(() => {
    if (!requests) return;

    const newChanges: Record<string, boolean> = {};

    requests.forEach((request) => {
      const requestId = request.id;
      const currentBid = request.bids && request.bids.length > 0 ? request.bids[0] : null;
      const currentBestDiscount = currentBid ? currentBid.discountPercent : null;
      const previousData = previousDiscounts.current[requestId];

      // Check if this is a new request or if the best discount has changed
      if (!previousData) {
        // First time seeing this request - don't trigger animation
        previousDiscounts.current[requestId] = {
          id: requestId,
          bestDiscount: currentBestDiscount,
          timestamp: Date.now()
        };
      } else if (
        previousData.bestDiscount !== currentBestDiscount &&
        currentBestDiscount !== null &&
        previousData.bestDiscount !== null
      ) {
        // Best discount has changed - trigger animation
        newChanges[requestId] = true;
        previousDiscounts.current[requestId] = {
          id: requestId,
          bestDiscount: currentBestDiscount,
          timestamp: Date.now()
        };
      } else {
        // Update the stored data without triggering animation
        previousDiscounts.current[requestId] = {
          id: requestId,
          bestDiscount: currentBestDiscount,
          timestamp: Date.now()
        };
      }
    });

    // Set the changes and clear them after a short delay
    if (Object.keys(newChanges).length > 0) {
      setDiscountChanges(newChanges);
      
      // Clear the changes after animation duration
      setTimeout(() => {
        setDiscountChanges({});
      }, 2000);
    }
  }, [requests]);

  const triggerAnimation = (requestId: string) => {
    setDiscountChanges(prev => ({
      ...prev,
      [requestId]: true
    }));

    // Clear after animation duration
    setTimeout(() => {
      setDiscountChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[requestId];
        return newChanges;
      });
    }, 2000);
  };

  return {
    discountChanges,
    triggerAnimation
  };
};
