import React from 'react';
import { Marquee } from '../ui/Marquee';
import { siteConfig } from '../../config/site';

// Clean neutral monochrome inline glyphs
function GenericAiGlyph({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function CorpusBookGlyph({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10M6 10h10" />
    </svg>
  );
}

export const TrustStrip: React.FC = () => {
  const renderCompatBadge = (item: { name: string; category: string }, isEvidence: boolean) => (
    <div
      key={item.name}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-rule/70 bg-surface/80 text-ink-muted hover:text-ink hover:border-rule-strong transition-all duration-150 select-none group"
    >
      {isEvidence ? (
        <CorpusBookGlyph className="w-3.5 h-3.5 text-teal shrink-0 opacity-70 group-hover:opacity-100" />
      ) : (
        <GenericAiGlyph className="w-3.5 h-3.5 text-teal shrink-0 opacity-70 group-hover:opacity-100" />
      )}
      <div className="flex flex-col">
        <span className="font-mono text-xs font-semibold text-ink-muted group-hover:text-ink tracking-tight whitespace-nowrap">
          {item.name}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-muted/60 -mt-0.5 whitespace-nowrap">
          {item.category}
        </span>
      </div>
    </div>
  );

  const worksWithNodes = siteConfig.worksWith.map((item) => renderCompatBadge(item, false));
  const evidenceFromNodes = siteConfig.evidenceFrom.map((item) => renderCompatBadge(item, true));

  return (
    <section
      aria-label="Compatibility and Source Records"
      className="py-8 border-b border-rule bg-surface-subtle/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Row 1: Works with */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink-muted shrink-0 w-28">
              Works with:
            </span>
            {/* Desktop Static Row */}
            <div className="hidden md:flex flex-wrap items-center gap-3 flex-1">
              {worksWithNodes}
            </div>
          </div>
          {/* Mobile Auto-Marquee */}
          <div className="md:hidden">
            <Marquee speed={24} gap="0.75rem" ariaLabel="Supported language model families">
              {worksWithNodes}
            </Marquee>
          </div>
        </div>

        {/* Row 2: Evidence from */}
        <div className="space-y-2 pt-2 border-t border-rule/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink-muted shrink-0 w-28">
              Evidence from:
            </span>
            {/* Desktop Static Row */}
            <div className="hidden md:flex flex-wrap items-center gap-3 flex-1">
              {evidenceFromNodes}
            </div>
          </div>
          {/* Mobile Auto-Marquee */}
          <div className="md:hidden">
            <Marquee speed={26} direction="right" gap="0.75rem" ariaLabel="Authoritative evidence corpora">
              {evidenceFromNodes}
            </Marquee>
          </div>
        </div>

        {/* Independence Disclaimer Note */}
        <div className="text-right pt-1">
          <span className="font-mono text-[10px] text-ink-muted/80">
            Names shown for compatibility. VeriAI is independent and non-profit.
          </span>
        </div>
      </div>
    </section>
  );
};

