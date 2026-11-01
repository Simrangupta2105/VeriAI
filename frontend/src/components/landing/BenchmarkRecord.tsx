import React from 'react';
import { Card } from '../ui/Card';
import { CountUp } from '../ui/CountUp';
import { siteConfig } from '../../config/site';

export const BenchmarkRecord: React.FC = () => {
  const metrics = [
    {
      metric: 'Precision',
      value: siteConfig.benchmarkStats.precision,
      definition: 'Ratio of correctly identified contradictions among all flagged claims.',
    },
    {
      metric: 'Recall',
      value: siteConfig.benchmarkStats.recall,
      definition: 'Coverage rate of identified factual distortions across adversarial suites.',
    },
    {
      metric: 'F1 Metric',
      value: siteConfig.benchmarkStats.f1,
      definition: 'Harmonic mean of precision and recall across historical & numerical inquiries.',
    },
    {
      metric: 'ECE Calibration',
      value: siteConfig.benchmarkStats.ece,
      definition: 'Expected Calibration Error measuring alignment between confidence & accuracy.',
    },
  ];

  return (
    <section className="py-20 border-b border-rule bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="font-mono text-xs uppercase tracking-wider text-teal">
            Empirical Validation
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Calibrated on adversarial benchmark suites.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            The verification pipeline is continuously tested against{' '}
            <CountUp value={siteConfig.benchmarkStats.testedCases} /> adversarial test cases, including synthetic citations, outdated population tallies, unit conversion errors, and subtle year inversions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <Card key={m.metric} className="p-6 space-y-2 bg-surface">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted block">
                {m.metric}
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-bold text-ink">
                <CountUp value={m.value} />
              </div>
              <p className="text-xs text-ink-muted leading-snug pt-1">
                {m.definition}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
