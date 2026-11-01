import React from 'react';
import { Card } from '../ui/Card';

export const VerificationLedger: React.FC = () => {
  const anomalies = [
    {
      code: 'ERR-01',
      type: 'Temporal Drift',
      summary: 'Legitimate entities linked to mistaken centuries or calendar years.',
      detail: 'Language models frequently generate correct organizational names and accomplishments, while sliding founding dates or treaty signings by several years due to token interpolation.',
    },
    {
      code: 'ERR-02',
      type: 'Synthetic Citation',
      summary: 'Plausible academic titles, nonexistent journal volumes, and ghost authors.',
      detail: 'When asked for sources, generative models mimic bibliographic grammar rather than referencing indexing databases, inventing citations that resemble peer-reviewed papers.',
    },
    {
      code: 'ERR-03',
      type: 'Quantification Distortion',
      summary: 'Subtle shifts in magnitudes, currency units, and unit conversions.',
      detail: 'Numerical quantities are prone to compounding rounding errors or unit conflations (e.g., reporting metric light speed in imperial units without proportional conversion).',
    },
    {
      code: 'ERR-04',
      type: 'Contextual Conflation',
      summary: 'Blending provisional patent filings with recognized primary inventors.',
      detail: 'Complex historical timelines (such as the telephone dispute between Bell, Gray, and Meucci) are flattened into oversimplified or falsely definitive factual statements.',
    },
  ];

  return (
    <section className="py-20 border-b border-rule bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="font-mono text-xs uppercase tracking-wider text-teal">
            The Inspection Ledger
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Where surface inspection fails.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Generative text fails in structured, recurring ways. Because paragraphs remain grammatically polished, manual human review frequently misses subtle factual inversions.
          </p>
        </div>

        {/* 4-Column Editorial Ledger Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {anomalies.map((item) => (
            <Card key={item.code} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rule font-mono text-[11px] text-ink-muted">
                  <span>{item.code}</span>
                  <span className="text-ochre uppercase font-bold">Discrepancy</span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {item.type}
                </h3>
                <p className="text-xs font-medium text-ink leading-snug">
                  {item.summary}
                </p>
                <p className="text-xs text-ink-muted leading-relaxed font-sans">
                  {item.detail}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

