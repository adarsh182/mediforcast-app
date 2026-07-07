import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Stitch-inspired elevated Card container component.
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn(
        'glass-panel rounded-3xl p-6 md:p-8 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={cn('mb-6 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={cn('font-headline-md text-headline-md text-on-surface tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={cn('font-body-sm text-body-sm text-on-surface-variant', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('mt-6 pt-4 border-t border-outline-variant flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
