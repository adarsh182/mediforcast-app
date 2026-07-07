import React from 'react';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} [children] - Content of the button
 * @property {'default' | 'outline' | 'ghost'} [variant] - Visual style variant
 * @property {boolean} [loading] - Loading state that renders a spinner and disables the button
 * @property {boolean} [disabled] - Disabled state
 * @property {string} [className] - Additional Tailwind classes
 * @property {'button' | 'submit' | 'reset'} [type] - Button type attribute
 */

/**
 * Stitch-inspired accessible Button component.
 * @param {ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = ({
  children,
  variant = 'default',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center gap-2 rounded-full py-3 px-6 font-medium font-body-md text-[16px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default:
      'bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-th-primary/20 hover:shadow-th-primary/40 transform hover:-translate-y-0.5',
    outline:
      'bg-transparent border border-th-border hover:bg-th-card-hover text-th-text hover:text-th-primary',
    ghost:
      'bg-transparent hover:bg-th-card-hover text-th-text-secondary hover:text-th-text',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyle, variants[variant] || variants.default, className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
};

export default Button;
