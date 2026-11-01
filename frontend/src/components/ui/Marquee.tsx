import React from 'react';
import { clsx } from 'clsx';

export interface MarqueeProps {
  items?: React.ReactNode[];
  children?: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number; // seconds per loop on desktop
  mobileSpeed?: number; // seconds per loop on mobile (default: 1.25 * speed)
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  gap?: string;
  ariaLabel?: string;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  items,
  children,
  direction = 'left',
  speed = 30,
  mobileSpeed,
  pauseOnHover = true,
  pauseOnFocus = true,
  gap = '1.75rem',
  ariaLabel = 'Continuous ticker',
  className,
}) => {
  const content = items || (children ? [children] : []);
  const actualMobileSpeed = mobileSpeed || Math.round(speed * 1.2);

  const animationClass =
    direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={clsx(
        'relative w-full overflow-hidden marquee-mask select-none group',
        pauseOnHover && 'hover:[&_.marquee-content]:[animation-play-state:paused]',
        pauseOnFocus && 'focus-within:[&_.marquee-content]:[animation-play-state:paused]',
        className
      )}
      style={
        {
          '--marquee-duration': `${speed}s`,
        } as React.CSSProperties
      }
    >
      {/* Reduced-motion static fallback grid visible only under prefers-reduced-motion */}
      <div className="hidden motion-reduce:flex flex-wrap items-center justify-center gap-4 py-2">
        {content.map((item, idx) => (
          <div key={`static-${idx}`} className="shrink-0">
            {item}
          </div>
        ))}
      </div>

      {/* Animated loop container (hidden under reduced motion) */}
      <div className="flex w-max motion-reduce:hidden">
        {/* Track 1: Accessible Primary Content */}
        <div
          className={clsx('marquee-content flex shrink-0 items-center', animationClass)}
          style={{ gap }}
        >
          {content.map((item, idx) => (
            <div key={`primary-${idx}`} className="shrink-0">
              {item}
            </div>
          ))}
        </div>

        {/* Track 2: Seamless Duplicate Loop (aria-hidden) */}
        <div
          aria-hidden="true"
          className={clsx('marquee-content flex shrink-0 items-center', animationClass)}
          style={{ gap }}
        >
          {content.map((item, idx) => (
            <div key={`dup-${idx}`} className="shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

