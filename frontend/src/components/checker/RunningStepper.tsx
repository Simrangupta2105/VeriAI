import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const STAGES = [
  {
    num: '01',
    title: 'Atomic Proposition Extraction',
    desc: 'Parsing text into discrete, typed factual claims...',
  },
  {
    num: '02',
    title: 'Query Planning & Entity Anchors',
    desc: 'Formulating targeted queries across reference records...',
  },
  {
    num: '03',
    title: 'Multi-Source Evidence Retrieval',
    desc: 'Querying Wikipedia REST API and DuckDuckGo for matching passages...',
  },
  {
    num: '04',
    title: 'Source Provenance Scoring (0–100)',
    desc: 'Evaluating domain authority, archival stability, and lexical relevance...',
  },
  {
    num: '05',
    title: 'Grounded NLI Verdict Assignment',
    desc: 'Checking claim truth strictly against retrieved context chunks...',
  },
  {
    num: '06',
    title: 'Adversarial Critic Pass & Metrics',
    desc: 'Auditing verdicts for temporal inconsistencies and confirmation bias...',
  },
];

export const RunningStepper: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const active = STAGES[currentStage];

  return (
    <div className="p-6 sm:p-8 rounded border border-rule bg-surface shadow-hairline space-y-6 my-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-rule">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-teal">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Inspection Protocol Active • Stage {active.num}/06</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
            {active.title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-ink-muted">{active.desc}</p>
        </div>
      </div>

      {/* Progress Ledger Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {STAGES.map((s, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={s.num}
              className={`p-3 rounded border transition-colors ${
                isCurrent
                  ? 'border-teal bg-teal-surface text-teal font-bold'
                  : isDone
                  ? 'border-rule bg-surface-subtle text-ink font-medium'
                  : 'border-rule/50 bg-surface text-ink-muted/60'
              }`}
            >
              <div className="text-[10px] text-ink-muted">Stage {s.num}</div>
              <div className="text-[11px] truncate mt-1">{s.title.split(' ')[0]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
