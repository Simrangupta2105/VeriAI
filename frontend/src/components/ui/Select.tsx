import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className,
  id,
  ...props
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={generatedId} className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={generatedId}
          className={clsx(
            'w-full appearance-none rounded border border-rule bg-surface px-3 py-1.5 pr-8 text-xs font-mono text-ink focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-colors disabled:opacity-50 cursor-pointer shadow-hairline',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-ink-muted">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
