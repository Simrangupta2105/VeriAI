import React from 'react';
import { clsx } from 'clsx';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={clsx(
        'inline-flex items-center justify-between gap-4 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-ink uppercase tracking-wide">{label}</span>}
          {description && (
            <span className="text-xs text-ink-muted leading-relaxed max-w-sm">{description}</span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-rule transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal',
          checked ? 'bg-teal' : 'bg-surface-subtle'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-hairline transition duration-150 ease-in-out mt-px',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </label>
  );
};
