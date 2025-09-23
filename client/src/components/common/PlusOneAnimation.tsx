import { useState, useEffect } from 'react';

interface PlusOneAnimationProps {
  trigger: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  color?: 'green' | 'blue' | 'orange' | 'red';
}

export const PlusOneAnimation = ({ 
  trigger, 
  position = 'top-right',
  size = 'medium',
  color = 'green'
}: PlusOneAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // 2 seconds total animation

      return () => clearTimeout(timer);
    } else {
      // Reset visibility when trigger becomes false
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
        // Fallback styles in case CSS classes don't work
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
