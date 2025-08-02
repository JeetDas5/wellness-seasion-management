import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
}

export default function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Try Again',
  className = '',
  variant = 'card'
}: ErrorMessageProps) {
  const baseClasses = 'flex items-start space-x-3';
  
  const variantClasses = {
    inline: 'text-red-600 text-sm',
    card: 'bg-red-50 border border-red-200 rounded-lg p-4',
    banner: 'bg-red-50 border-l-4 border-red-400 p-4'
  };

  const iconClasses = {
    inline: 'h-4 w-4 text-red-500 mt-0.5',
    card: 'h-5 w-5 text-red-400 mt-0.5',
    banner: 'h-5 w-5 text-red-400 mt-0.5'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className={baseClasses}>
        <div className="flex-shrink-0">
          <svg
            className={iconClasses[variant]}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          {variant !== 'inline' && (
            <h3 className="text-sm font-medium text-red-800 mb-1">
              {title}
            </h3>
          )}
          
          <p className={`text-sm ${variant === 'inline' ? 'text-red-600' : 'text-red-700'}`}>
            {message}
          </p>
          
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm bg-red-100 text-red-800 px-3 py-2 rounded-md hover:bg-red-200 active:bg-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 touch-manipulation min-h-[36px]"
              >
                {retryText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}