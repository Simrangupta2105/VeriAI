import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-tight';

    const variants = {
      primary:
        'bg-teal text-white hover:bg-teal-hover border border-transparent shadow-hairline',
      secondary:
        'bg-surface-subtle text-ink hover:bg-rule/40 border border-rule',
      outline:
        'border border-rule bg-surface text-ink hover:bg-surface-subtle shadow-hairline',
      text:
        'text-ink-muted hover:text-ink underline-offset-4 hover:underline bg-transparent border-transparent p-0',
      danger:
        'bg-verdict-contra text-white hover:bg-verdict-contra/90 border border-transparent shadow-hairline',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1 gap-1.5',
      md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2',
      lg: 'text-sm sm:text-base px-4 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseClasses, variants[variant], variant !== 'text' && sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
