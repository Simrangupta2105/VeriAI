import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export interface GaugeProps {
  value: number; // 0 to 100
  size?: number; // width in px
  label?: string;
  sublabel?: string;
  className?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  size = 220,
  label = 'Evidence Corroboration Index',
  sublabel,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const normalizedValue = Math.max(0, Math.min(100, Math.round(value)));

  useEffect(() => {
    let start = 0;
    const duration = 600;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = normalizedValue / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= normalizedValue) {
        setDisplayValue(normalizedValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [normalizedValue]);

  // Semicircle geometry
  const width = size;
  const height = size * 0.58;
  const cx = width / 2;
  const cy = height - 12;
  const r = (width - 36) / 2;

  // Angle from -180 to 0 degrees (left to right)
  const angleDeg = -180 + (normalizedValue / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Needle end point
  const needleLength = r - 10;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy + needleLength * Math.sin(angleRad);

  // Verdict rating
  let statusColor = 'text-verdict-supported';
  let ratingText = 'High Corroboration';
  if (normalizedValue < 50) {
    statusColor = 'text-verdict-contra';
    ratingText = 'Severe Discrepancies';
  } else if (normalizedValue < 75) {
    statusColor = 'text-verdict-partial';
    ratingText = 'Partial / Mixed Corroboration';
  }

  return (
    <div className={clsx('flex flex-col items-center select-none', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Background Arc: Semicircle */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-rule"
        />

        {/* Band Segments */}
        {/* 0 - 50: Contradicted band */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
          fill="none"
          stroke="var(--color-verdict-contra)"
          strokeWidth="6"
          strokeOpacity="0.45"
        />
        {/* 50 - 75: Partial band */}
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * Math.cos((-45 * Math.PI) / 180)} ${cy + r * Math.sin((-45 * Math.PI) / 180)}`}
          fill="none"
          stroke="var(--color-verdict-partial)"
          strokeWidth="6"
          strokeOpacity="0.5"
        />
        {/* 75 - 100: Supported band */}
        <path
          d={`M ${cx + r * Math.cos((-45 * Math.PI) / 180)} ${cy + r * Math.sin((-45 * Math.PI) / 180)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--color-verdict-supported)"
          strokeWidth="6"
          strokeOpacity="0.85"
        />

        {/* Dial Ticks */}
        {[0, 25, 50, 75, 100].map((t) => {
          const a = (-180 + (t / 100) * 180) * (Math.PI / 180);
          const x1 = cx + (r - 4) * Math.cos(a);
          const y1 = cy + (r - 4) * Math.sin(a);
          const x2 = cx + (r + 4) * Math.cos(a);
          const y2 = cy + (r + 4) * Math.sin(a);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-ink-muted"
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="currentColor"
          strokeWidth="2"
          className="text-ink transition-all duration-300 ease-out"
        />
        <circle cx={cx} cy={cy} r="4" fill="currentColor" className="text-ink" />
      </svg>

      {/* Meter Display Numbers */}
      <div className="text-center -mt-2">
        <div className="font-mono text-3xl font-bold tracking-tight text-ink">
          {displayValue}
          <span className="text-xs text-ink-muted font-normal font-sans ml-1">/ 100</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-0.5">
          {label}
        </div>
        <div className={clsx('text-xs font-medium mt-1', statusColor)}>
          {sublabel || ratingText}
        </div>
      </div>
    </div>
  );
};
