import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface CountUpProps {
  value: string | number;
  duration?: number; // ms (default 500ms)
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 500,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<string>(
    shouldReduceMotion ? String(value) : '0'
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Parse numeric part and suffix/prefix (e.g. "92.4%" -> num: 92.4, suffix: "%")
  const rawString = String(value);
  const match = rawString.match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);
  const prefix = match ? match[1] : '';
  const targetNum = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : '';
  const isFloat = match ? match[2].includes('.') : false;
  const decimalPlaces = isFloat && match ? match[2].split('.')[1].length : 0;

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(rawString);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentNum = easeOut * targetNum;

            const formatted = isFloat
              ? currentNum.toFixed(decimalPlaces)
              : Math.round(currentNum).toString();

            setDisplayValue(`${prefix}${formatted}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(rawString);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, targetNum, duration, rawString, isFloat, decimalPlaces, prefix, suffix, shouldReduceMotion]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
};

