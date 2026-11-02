import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { AnnotatedText, TextAnnotation } from '../ui/AnnotatedText';
import { RotatingStatusLine } from './RotatingStatusLine';
import { useAnalyze } from '../../hooks/useVeriApi';
import { VerificationReport } from '../../types';

const INITIAL_PARAGRAPH =
  "SpaceX was founded in 1999 by Elon Musk to reduce space transportation costs. The aerospace manufacturer developed the Falcon 1 rocket, which successfully achieved Earth orbit in September 2008 on its fourth attempt. NASA later awarded the company a Commercial Resupply Services contract valued at $1.6 billion.";

const INITIAL_ANNOTATIONS: TextAnnotation[] = [
  {
    id: 'C01',
    spanText: 'SpaceX was founded in 1999',
    verdict: 'CONTRADICTED',
    note: 'Refuted: Delaware corporate registry and NASA records confirm incorporation occurred in March 2002.',
    citation: 'Delaware Div of Corps #3501249',
  },
  {
    id: 'C02',
    spanText: 'successfully achieved Earth orbit in September 2008 on its fourth attempt',
    verdict: 'SUPPORTED',
    note: 'Corroborated: Flight 4 reached low Earth orbit on September 28, 2008.',
    citation: 'FAA Launch Telemetry Logs (2008)',
  },
  {
    id: 'C03',
    spanText: 'NASA later awarded the company a Commercial Resupply Services contract valued at $1.6 billion',
    verdict: 'SUPPORTED',
    note: 'Corroborated: NASA announced the $1.6B CRS-1 contract award in December 2008.',
    citation: 'NASA Release C08-069',
  },
];

export const FactDeskHero: React.FC = () => {
  const [question, setQuestion] = useState("When was SpaceX founded and when did it achieve orbit?");
  const [answer, setAnswer] = useState(INITIAL_PARAGRAPH);
  const [activeReport, setActiveReport] = useState<VerificationReport | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true);

  const analyzeMutation = useAnalyze();

  const handleAudit = () => {
    if (!answer.trim()) return;
    analyzeMutation.mutate(
      {
        question: question.trim() || 'Factual statement verification',
        answer: answer.trim(),
        enable_critic: true,
      },
      {
        onSuccess: (report) => {
          setActiveReport(report);
          setMobileSheetOpen(true);
        },
      }
    );
  };

  const liveAnnotations: TextAnnotation[] = activeReport
    ? activeReport.claims.map((c) => {
        const res = activeReport.results.find((r) => r.claim_id === c.claim_id);
        const firstEv = activeReport.evidence.find(
          (e) => (res?.evidence_ids || []).includes(e.evidence_id) || e.claim_id === c.claim_id
        );
        return {
          id: c.claim_id,
          spanText: (c.original_sentence || c.claim).trim(),
          verdict: res?.verdict || 'UNVERIFIED',
          note: res?.reason || 'Evaluated against retrieved corpus.',
          citation: firstEv?.source_title || undefined,
        };
      })
    : INITIAL_ANNOTATIONS;

  return (
    <section className="pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-16">
        {/* Two-column Hero Header at 1024px+, Stacked below */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-baseline">
          {/* Left Column: Headline & Action CTAs (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-teal">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span>VeriAI Reference Desk • Public Audit Protocol</span>
            </div>

            <h1 className="font-display text-fluid-headline font-bold tracking-tight text-ink">
              An evidence-grounded audit desk for synthetic text.
            </h1>

            {/* Restrained Moving Status Verb Line */}
            <div className="py-0.5">
              <RotatingStatusLine />
            </div>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans max-w-2xl">
              Large language models compose fluent prose without empirical grounding. VeriAI decomposes paragraphs into testable propositions, cross-examines each against open reference records and primary sources, and publishes an auditable proof document.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/check">
                <Button size="lg" className="min-h-[48px]" icon={<ArrowUpRight className="w-4 h-4" />}>
                  Open the Audit Desk
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="min-h-[48px]">
                  Inspection Methodology
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Institutional Trust Notes (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded border border-rule bg-surface-subtle space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-wider text-ink text-[11px] pb-2 border-b border-rule">
              Fact-Desk Charter
            </div>
            <ul className="space-y-2 text-ink-muted text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-teal font-bold">•</span>
                <span>Non-profit public interest research</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal font-bold">•</span>
                <span>Open reference protocol for scholars, journalists & students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal font-bold">•</span>
                <span>No signups, paywalls or commercial token gates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal font-bold">•</span>
                <span>Local SQLite database persistence</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Proofread Document Specimen */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-rule font-mono text-xs text-ink-muted">
            <div>
              <span className="uppercase tracking-wider text-ink font-bold block">
                Proofread Document Specimen
              </span>
              <span className="text-[11px]">
                Interactive atomic decomposition with margin proof annotations
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuestion("When was SpaceX founded and when did it achieve orbit?");
                  setAnswer(INITIAL_PARAGRAPH);
                  setActiveReport(null);
                }}
                className="hover:text-ink underline text-[11px] min-h-[36px] flex items-center"
              >
                Reset sample
              </button>
            </div>
          </div>

          {/* Annotated Document Visualizer */}
          <AnnotatedText
            text={activeReport ? activeReport.answer : answer}
            annotations={liveAnnotations}
          />

          {/* Interactive Workbench: Side-by-side at 1024px+, Stacked below */}
          <Card className="p-5 sm:p-7 bg-surface-subtle border-rule space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-ink-muted pb-2 border-b border-rule/60">
              <span className="uppercase tracking-wider font-semibold text-ink">
                Try it now: Test a Custom Passage on the Desk
              </span>
              <span className="hidden sm:inline">Queried in real-time from open knowledge bases</span>
            </div>

            {/* Workbench Grid: Side-by-side at 1024px+, stacked below */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase text-ink-muted block font-semibold">
                  Original Inquiry / Target Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Inquiry context..."
                  className="w-full min-h-[44px] px-3.5 py-2 text-xs font-mono rounded border border-rule bg-surface text-ink focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase text-ink-muted block font-semibold">
                  AI-Generated Text Passage to Audit
                </label>
                <textarea
                  rows={2}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Paste paragraph to decompose into atomic claims..."
                  className="w-full min-h-[44px] px-3.5 py-2 text-xs font-sans rounded border border-rule bg-surface text-ink focus:outline-none focus:border-teal leading-relaxed resize-y"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rule/60">
              <span className="text-[11px] text-ink-muted font-mono">
                Deconstructs into testable claims • Evaluates Wikipedia & public archives
              </span>
              <Button
                size="md"
                onClick={handleAudit}
                isLoading={analyzeMutation.isPending}
                disabled={!answer.trim()}
                className="min-h-[44px]"
                icon={<Search className="w-4 h-4" />}
              >
                {analyzeMutation.isPending ? 'Executing Audit...' : 'Audit This Text'}
              </Button>
            </div>

            {analyzeMutation.isError && (
              <div className="p-3 rounded border border-verdict-contra/40 bg-verdict-contra-surface text-verdict-contra text-xs font-mono">
                Audit failure: {analyzeMutation.error.message}
              </div>
            )}

            {/* Desktop Result Summary */}
            {activeReport && (
              <div className="hidden lg:flex mt-4 p-4 rounded border border-rule bg-surface items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase text-ink-muted block">Corroboration Score</span>
                    <span className="text-xl font-bold text-ink">
                      {activeReport.overall_reliability}/100
                    </span>
                  </div>
                  <div className="h-8 w-px bg-rule" />
                  <div>
                    <span className="text-[10px] uppercase text-ink-muted block">Discrepancy Risk</span>
                    <span className="text-xl font-bold text-verdict-contra">
                      {activeReport.hallucination_risk}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-rule" />
                  <div>
                    <span className="text-[10px] uppercase text-ink-muted block">Propositions</span>
                    <span className="text-xl font-bold text-ink">
                      {activeReport.claims.length}
                    </span>
                  </div>
                </div>

                <Link to="/check" state={{ report: activeReport }}>
                  <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Open Detailed Inspection
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Sheet (Appears after check completes on small screens) */}
      {activeReport && mobileSheetOpen && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-4 bg-background/98 backdrop-blur-md border-t-2 border-teal shadow-elevation animate-in slide-in-from-bottom duration-200">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[9px] uppercase text-ink-muted block">Corroborated</span>
                <span className="font-bold text-sm text-ink">{activeReport.overall_reliability}/100</span>
              </div>
              <div className="h-6 w-px bg-rule" />
              <div>
                <span className="text-[9px] uppercase text-ink-muted block">Risk</span>
                <span className="font-bold text-sm text-verdict-contra">{activeReport.hallucination_risk}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/check" state={{ report: activeReport }}>
                <Button size="sm" className="min-h-[40px] text-xs">
                  <span>View Details</span>
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Dismiss sheet"
                className="p-2 text-ink-muted hover:text-ink min-h-[40px] min-w-[40px] flex items-center justify-center rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
