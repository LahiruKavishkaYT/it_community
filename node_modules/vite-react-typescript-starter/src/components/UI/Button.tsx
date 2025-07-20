import React from 'react';
import { useIsTouchDevice } from '../../hooks/useMediaQuery';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isTouch = useIsTouchDevice();

  const baseClasses = `
    relative inline-flex items-center justify-center font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${isTouch ? 'touch-feedback' : 'hover:scale-105'}
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500 border border-transparent
      ${loading ? 'hover:bg-blue-600' : ''}
    `,
    secondary: `
      bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-lg
      focus:ring-gray-500 border border-gray-600
      ${loading ? 'hover:bg-gray-700' : ''}
    `,
    outline: `
      bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white
      border border-gray-600 hover:border-gray-500 focus:ring-gray-500
      ${loading ? 'hover:bg-transparent hover:text-gray-300' : ''}
    `,
    ghost: `
      bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white
      border border-transparent focus:ring-gray-500
      ${loading ? 'hover:bg-transparent hover:text-gray-300' : ''}
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl
      focus:ring-red-500 border border-transparent
      ${loading ? 'hover:bg-red-600' : ''}
    `
  };

  const sizeClasses = {
    xs: `text-xs px-2 py-1 rounded ${isTouch ? 'min-h-[32px] min-w-[32px]' : ''}`,
    sm: `text-sm px-3 py-2 rounded-md ${isTouch ? 'min-h-[36px] min-w-[36px]' : ''}`,
    md: `text-sm px-4 py-2.5 rounded-lg ${isTouch ? 'min-h-[44px] min-w-[44px]' : ''}`,
    lg: `text-base px-6 py-3 rounded-lg ${isTouch ? 'min-h-[48px] min-w-[48px]' : ''}`,
    xl: `text-lg px-8 py-4 rounded-xl ${isTouch ? 'min-h-[56px] min-w-[56px]' : ''}`
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'h-3 w-3';
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-4 w-4';
      case 'lg': return 'h-5 w-5';
      case 'xl': return 'h-6 w-6';
      default: return 'h-4 w-4';
    }
  };

  const iconSize = getIconSize();

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={`animate-spin ${iconSize} text-current`}
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
        </div>
      )}
      
      <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && (
          <span className={`${iconSize} flex-shrink-0`}>
            {leftIcon}
          </span>
        )}
        
        <span className={fullWidth ? 'flex-1 text-center' : ''}>{children}</span>
        
        {rightIcon && (
          <span className={`${iconSize} flex-shrink-0`}>
            {rightIcon}
          </span>
        )}
      </span>
    </button>
  );
};

export default Button; 