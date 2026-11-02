import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={generatedId} className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={generatedId}
          className={twMerge(
            clsx(
              'w-full rounded border border-rule bg-surface p-3 text-sm text-ink placeholder:text-ink-muted/50 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-colors resize-y font-sans leading-relaxed shadow-hairline',
              error && 'border-verdict-contra focus:border-verdict-contra focus:ring-verdict-contra',
              className
            )
          )}
          {...props}
        />
        {(error || helperText) && (
          <span
            className={clsx(
              'text-[11px]',
              error ? 'text-verdict-contra font-mono' : 'text-ink-muted'
            )}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
