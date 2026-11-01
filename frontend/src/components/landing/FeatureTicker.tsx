import React from 'react';
import {
  ScanText,
  Link2,
  Globe,
  Gauge,
  CalendarX,
  ShieldCheck,
  UserX,
  Lock,
  Code2,
  FileDown,
  MessageSquare,
  Check,
} from 'lucide-react';
import { Marquee } from '../ui/Marquee';
import { siteConfig, TickerItem } from '../../config/site';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ScanText,
  Link2,
  Globe,
  Gauge,
  CalendarX,
  ShieldCheck,
  UserX,
  Lock,
  Code2,
  FileDown,
  MessageSquare,
};

function renderTickerNode(item: TickerItem, key: string) {
  const IconComponent = ICON_MAP[item.iconName] || Check;

  return (
    <div key={key} className="flex items-center gap-3 py-1 px-1">
      <div className="flex items-center gap-2">
        <IconComponent className="w-3.5 h-3.5 text-teal shrink-0" />
        <span className="font-mono text-xs uppercase tracking-wider text-ink-muted group-hover:text-ink transition-colors whitespace-nowrap">
          {item.label}
        </span>
      </div>
      {/* Small Teal Tick Separator */}
      <span className="text-teal font-mono text-xs opacity-60 ml-3 select-none" aria-hidden="true">
        •
      </span>
    </div>
  );
}

export const FeatureTicker: React.FC = () => {
  const tickerItems = siteConfig.tickerItems.map((item: TickerItem, idx: number) =>
    renderTickerNode(item, `ticker-${idx}`)
  );

  return (
    <section
      aria-label="Fact-Desk Core Capabilities"
      className="w-full bg-surface/60 border-y border-rule py-1"
    >
      <Marquee
        items={tickerItems}
        direction="left"
        speed={36}
        gap="1.75rem"
        ariaLabel="Core technical capabilities"
      />
    </section>
  );
};

