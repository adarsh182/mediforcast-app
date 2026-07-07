import React from 'react';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} InputProps
 * @property {string} [label] - Input label text
 * @property {string} [error] - Error message to display under the input
 * @property {string} [icon] - Material Symbol icon name to prepend inside the input
 * @property {'text' | 'email' | 'password' | 'number' | 'textarea' | 'select'} [type] - Component type
 * @property {React.ReactNode} [children] - Options for select components
 * @property {string} [className] - Optional container className overrides
 * @property {string} [inputClassName] - Optional input element className overrides
 */

/**
 * Stitch-inspired accessible Input, Textarea, and Select form component.
 * @param {InputProps & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.SelectHTMLAttributes<HTMLSelectElement>} props
 */
export const Input = ({
  label,
  error,
  icon,
  type = 'text',
  children,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const baseInputStyle =
    'w-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-th-border/50 rounded-xl text-th-text font-body-md placeholder-th-text-muted hover:border-th-primary/50 hover:bg-white/70 dark:hover:bg-black/40 focus:border-th-primary focus:ring-4 focus:ring-th-primary/20 focus:bg-white dark:focus:bg-black/60 focus:outline-none focus:-translate-y-0.5 focus:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  // Extra padding if icon is present
  const iconPaddingClass = icon ? 'pl-10 pr-4' : 'px-4';

  const renderInputElement = () => {
    if (type === 'textarea') {
      return (
        <textarea
          className={cn(baseInputStyle, 'py-3.5', iconPaddingClass, 'resize-none', inputClassName)}
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          className={cn(
            baseInputStyle,
            'py-3.5',
            iconPaddingClass,
            'appearance-none',
            inputClassName
          )}
          {...props}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        type={type}
        className={cn(baseInputStyle, 'py-3.5', iconPaddingClass, inputClassName)}
        {...props}
      />
    );
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
      {label && (
        <label htmlFor={props.id} className="font-label-md text-label-md text-on-surface-variant block">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none select-none">
            {icon}
          </span>
        )}
        {renderInputElement()}
        {type === 'select' && (
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none select-none">
            arrow_drop_down
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error font-medium pl-1">{error}</p>}
    </div>
  );
};

export default Input;
