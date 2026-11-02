import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, useReducedMotion } from 'framer-motion';
import { VerdictType } from '../../types';
import { VERDICT_MAP } from '../../lib/verdict';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'teal' | 'ochre' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-mono font-medium rounded border select-none';

  const variants = {
    default: 'bg-surface-subtle text-ink-muted border-rule',
    teal: 'bg-teal-surface text-teal border-teal/30',
    ochre: 'bg-ochre-surface text-ochre border-ochre/30',
    outline: 'bg-transparent text-ink border-rule',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.2 gap-1 tracking-wider uppercase',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};

export interface VerdictTagProps {
  verdict: VerdictType | string;
  showCode?: boolean;
  size?: 'sm' | 'md';
  animateStamp?: boolean;
  className?: string;
}

export const VerdictTag: React.FC<VerdictTagProps> = ({
  verdict,
  showCode = true,
  size = 'md',
  animateStamp = true,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const config = VERDICT_MAP[verdict as VerdictType] || VERDICT_MAP.UNVERIFIED;
  const Icon = config.icon;

  const iconEl = <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-mono font-medium border rounded select-none',
          config.badgeClass,
          size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1.5',
          className
        )
      )}
    >
      {animateStamp && !shouldReduceMotion ? (
        <motion.span
          initial={{ scale: 1.25, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="inline-flex items-center"
        >
          {iconEl}
        </motion.span>
      ) : (
        iconEl
      )}
      <span>{config.label}</span>
      {showCode && <span className="opacity-60 text-[9px]">[{config.code}]</span>}
    </span>
  );
};
