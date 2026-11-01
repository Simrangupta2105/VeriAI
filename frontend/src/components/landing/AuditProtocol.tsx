import React from 'react';
import { Card } from '../ui/Card';
import { motion, useReducedMotion } from 'framer-motion';
import { Scissors, Compass, Globe, Scale, CheckCircle2, ShieldAlert } from 'lucide-react';

const STAGES = [
  {
    num: '01',
    title: 'Atomic Proposition Extraction',
    icon: Scissors,
    description: 'The incoming passage is stripped of rhetorical filler and decomposed into standalone, truth-evaluable factual claims. Subjective statements and value assertions are tagged as non-factual rather than false.',
  },
  {
    num: '02',
    title: 'Entity Anchoring & Search Planning',
    icon: Compass,
    description: 'Named entities, calendar constraints, and numerical propositions are isolated. The planner drafts orthogonal search queries targeted at historical registers and primary encyclopedia archives.',
  },
  {
    num: '03',
    title: 'Multi-Source Evidence Retrieval',
    icon: Globe,
    description: 'Queries are executed against the Wikipedia REST API and real-time open web sources. Rather than trusting brief metadata blurbs, the retriever extracts full paragraph context around matching terms.',
  },
  {
    num: '04',
    title: 'Source Provenance Grading (0–100)',
    icon: Scale,
    description: 'Publishers and host domains are graded on an explainable rubric: governmental/intergovernmental registries (+92), peer-reviewed academic repos (+88), reference encyclopedias (+75), and UGC forums (25).',
  },
  {
    num: '05',
    title: 'Grounded Natural Language Inference',
    icon: CheckCircle2,
    description: 'The proposition is evaluated strictly against retrieved evidence text. If evidence is lacking, an UNVERIFIED verdict is rendered. The system never guesses whether an uncorroborated statement is true or false.',
  },
  {
    num: '06',
    title: 'Adversarial Critic Pass & Scoring',
    icon: ShieldAlert,
    description: 'An independent audit stage challenges verdicts for confirmation bias and temporal contradictions, revoking SUPPORTED status if provenance scores fall below rigorous confidence thresholds.',
  },
];

export const AuditProtocol: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="font-mono text-xs uppercase tracking-wider text-teal">
            System Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            The 6-stage reference audit protocol.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Rather than asking another generative model for its subjective impression, VeriAI executes an asynchronous multi-agent pipeline designed for verifiable traceability.
          </p>
        </div>

        {/* 6 Stages Ledger with Timeline Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;

            return (
              <Card key={stage.num} className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-teal font-bold">
                      Protocol Stage {stage.num}
                    </span>
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
                      className="w-7 h-7 rounded border border-rule bg-surface-subtle flex items-center justify-center text-teal"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>
                  <h3 className="font-display text-base font-bold text-ink">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
