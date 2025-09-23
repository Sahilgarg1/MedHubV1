import React, { useState } from 'react';
import { MapPin, Package, CheckCircle, Loader2 } from 'lucide-react';
import { usePickupPoints } from '../../hooks/usePickupPoints';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pickupPoint?: string) => void;
  productName: string;
  quantity: number;
  totalPrice: number;
  isLoading?: boolean;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  quantity,
  totalPrice,
  isLoading = false
}) => {
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const { data: pickupPoints, isLoading: isLoadingPickupPoints } = usePickupPoints();

  const handleConfirm = () => {
    if (!selectedPickupPoint) {
      alert('Please select a pickup point to continue.');
      return;
    }
    onConfirm(selectedPickupPoint);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-6 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-900">Confirm Order</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{quantity} units</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-medium">Total Price:</span>
                <span className="font-bold text-lg">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable Pickup Point Selection */}
        <div className="px-6 flex-1 min-h-0">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MapPin className="w-4 h-4 inline mr-1" />
              Select Pickup Point
            </label>
            
            {isLoadingPickupPoints ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading pickup points...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">

                {pickupPoints?.map((point: any) => {
                  const isSelected = selectedPickupPoint === point.id;
                  return (
                    <label 
                      key={point.id} 
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 mt-1">
                        <input
                          type="radio"
                          name="pickupPoint"
                          value={point.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedPickupPoint(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium transition-colors duration-200 ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {point.name}
                        </div>
                        <div className={`text-sm transition-colors duration-200 ${
                          isSelected ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {point.address}
                        </div>
                        {point.description && (
                          <div className={`text-xs mt-1 transition-colors duration-200 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {point.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="p-6 flex-shrink-0 border-t border-gray-200">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || isLoadingPickupPoints || !selectedPickupPoint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <CheckCircle className="w-4 h-4" />
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
