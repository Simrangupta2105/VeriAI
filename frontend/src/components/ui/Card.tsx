import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  subtle?: boolean;
  hoverLift?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, subtle = false, hoverLift = false, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'border border-rule rounded bg-surface shadow-hairline transition-colors',
          subtle && 'bg-surface-subtle',
          hoverLift && 'hover:border-rule-strong transition-all duration-150',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
