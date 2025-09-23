import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';

// Base modal component
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  icon
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {icon}
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {children}

          {/* Actions */}
          {actions && (
            <div className="mt-6">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
        };
      case 'info':
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-blue-500" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  const styles = getVariantStyles();

  const actions = (
    <div className="flex gap-3 justify-end">
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 cursor-pointer ${styles.confirmButton}`}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {confirmText}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={styles.icon}
      actions={actions}
    >
      <div className="space-y-4">
        <p className="text-gray-600 mb-4">{message}</p>
      </div>
    </BaseModal>
  );
};


// Success modal
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  showOrdersButton?: boolean;
  isLoading?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  showOrdersButton = false,
  isLoading = false
}) => {
  const navigate = useNavigate();

  const handleGoToOrders = () => {
    navigate('/app/orders');
    onClose();
  };

  const actions = (
    <div className="flex gap-3 justify-end">
      {showOrdersButton && (
        <button
          onClick={handleGoToOrders}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Go to Orders
        </button>
      )}
      <button
        onClick={onConfirm || onClose}
        disabled={isLoading}
        className="px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 cursor-pointer bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {confirmText}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<CheckCircle className="text-green-600" size={24} />}
      actions={actions}
    >
      <div className="space-y-4">
        <p className="text-gray-600 mb-4">{message}</p>
      </div>
    </BaseModal>
  );
};
