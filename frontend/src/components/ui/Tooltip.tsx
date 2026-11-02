import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2 py-1 text-[11px] font-mono text-white bg-ink rounded border border-rule shadow-elevation whitespace-nowrap pointer-events-none"
        >
          {content}
        </span>
      )}
    </span>
  );
};

