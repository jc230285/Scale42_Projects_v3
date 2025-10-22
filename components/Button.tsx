'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`;
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
      case 'outline':
        return `${baseClasses} border border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 focus:ring-blue-500`;
      case 'ghost':
        return `${baseClasses} bg-transparent hover:bg-zinc-800 text-zinc-100 focus:ring-blue-500`;
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getWidthClasses = () => {
    return fullWidth ? 'w-full' : '';
  };

  const getDisabledClasses = () => {
    return (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';
  };

  return (
    <button
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getWidthClasses()}
        ${getDisabledClasses()}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;