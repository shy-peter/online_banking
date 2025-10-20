import React from 'react';
import { DollarSign } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <DollarSign className={`${iconSizes[size]} text-primary-600`} />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;