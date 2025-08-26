import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin ${sizeClasses[size]} border-2 border-blue-500 border-t-transparent rounded-full`}>
      </div>
      {text && (
        <div className="mt-3 text-sm text-gray-600">
          {text}
        </div>
      )}
    </div>
  );
};