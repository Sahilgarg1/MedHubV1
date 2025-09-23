import React, { useState, useEffect } from 'react';

// Plus One Animation Component
interface PlusOneAnimationProps {
  trigger: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  color?: 'green' | 'blue' | 'orange' | 'red';
}

export const PlusOneAnimation: React.FC<PlusOneAnimationProps> = ({ 
  trigger, 
  position = 'top-right',
  size = 'medium',
  color = 'green'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [trigger]);

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2', 
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  };

  const sizeClasses = {
    'small': 'text-xs px-1.5 py-0.5',
    'medium': 'text-sm px-2 py-1',
    'large': 'text-base px-3 py-1.5'
  };

  const colorClasses = {
    'green': 'bg-green-500 text-white',
    'blue': 'bg-blue-500 text-white',
    'orange': 'bg-orange-500 text-white',
    'red': 'bg-red-500 text-white'
  };

  return (
    <div 
      className={`
        absolute ${positionClasses[position]} z-50
        ${sizeClasses[size]} ${colorClasses[color]}
        rounded-full font-bold shadow-lg
        ${isVisible ? 'plus-one-animation' : 'opacity-0'}
      `}
      style={{
        position: 'absolute',
        zIndex: 50,
        borderRadius: '50%',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        animation: isVisible ? 'plusOneFadeOut 2s ease-out forwards' : 'none'
      }}
    >
      +1
    </div>
  );
};

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    'small': 'w-4 h-4',
    'medium': 'w-8 h-8',
    'large': 'w-12 h-12'
  };

  return (
    <div className={`loading-spinner ${size} ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg'
}) => {
  const paddingClasses = {
    'none': '',
    'sm': 'p-3',
    'md': 'p-6',
    'lg': 'p-8'
  };

  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg'
  };

  const roundedClasses = {
    'none': '',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl'
  };

  return (
    <div className={`
      bg-white border border-gray-200
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${roundedClasses[rounded]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Button Component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    'primary': 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    'secondary': 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    'outline': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary',
    'ghost': 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    'danger': 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    'sm': 'px-3 py-1.5 text-sm',
    'md': 'px-4 py-2 text-sm',
    'lg': 'px-6 py-3 text-base'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      )}
      {children}
    </button>
  );
};
