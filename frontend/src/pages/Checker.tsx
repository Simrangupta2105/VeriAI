import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { CheckerInputCard } from '../components/checker/CheckerInputCard';
import { RunningStepper } from '../components/checker/RunningStepper';
import { ResultsDashboard } from '../components/checker/ResultsDashboard';
import { useAnalyze, useHealth } from '../hooks/useVeriApi';
import { VerificationReport } from '../types';
import { AlertTriangle, RefreshCw, SlidersHorizontal, CheckSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Checker: React.FC = () => {
  const location = useLocation();
  const initialReport = (location.state as { report?: VerificationReport })?.report || null;

  const [currentReport, setCurrentReport] = useState<VerificationReport | null>(initialReport);
  const [mobileTab, setMobileTab] = useState<'input' | 'results'>(initialReport ? 'results' : 'input');
  const [lastRequest, setLastRequest] = useState<any>(null);

  const { isError: isOffline } = useHealth();
  const analyzeMutation = useAnalyze();

  const handleRunVerify = (data: {
    question: string;
    answer: string;
    modelName: string;
    enableCritic: boolean;
  }) => {
    setLastRequest(data);
    analyzeMutation.mutate(
      {
        question: data.question,
        answer: data.answer,
        model_name: data.modelName,
        enable_critic: data.enableCritic,
      },
      {
        onSuccess: (report: VerificationReport) => {
          setCurrentReport(report);
          setMobileTab('results');
        },
      }
    );
  };

  const handleRetry = () => {
    if (lastRequest) {
      handleRunVerify(lastRequest);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8">
        {/* Offline Banner */}
        {isOffline && (
          <div className="p-4 rounded border border-verdict-partial/40 bg-verdict-partial-surface text-ink text-xs font-mono flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-verdict-partial" />
            <div>
              <strong>Desk Offline Notice:</strong> Backend disconnected. Ensure the FastAPI server is running on port 8000.
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="space-y-2 border-b border-rule pb-6">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-teal">
            <span>Reference Audit Desk • Claim-by-Claim Verification</span>
          </div>
          <h1 className="font-display text-fluid-subhead font-bold tracking-tight text-ink">
            Audit Synthetic Propositions
          </h1>
          <p className="text-sm text-ink-muted max-w-2xl font-sans">
            Submit any text passage. The desk decomposes propositions, queries independent encyclopedia records, grades publisher provenance, and tests for confirmation bias.
          </p>
        </div>

        {/* Mobile Segmented Switch (Visible below 1024px when report is present) */}
        {currentReport && (
          <div className="lg:hidden flex rounded border border-rule bg-surface p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setMobileTab('input')}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded transition-colors ${
                mobileTab === 'input'
                  ? 'bg-teal text-white font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Input Parameters</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('results')}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded transition-colors ${
                mobileTab === 'results'
                  ? 'bg-teal text-white font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Inspection Report</span>
            </button>
          </div>
        )}

        {/* Dual Layout: Side-by-side or stacked on desktop; segmented on mobile */}
        <div className="space-y-8">
          {/* Input Form: Hidden on mobile when viewing results tab */}
          <div className={currentReport && mobileTab === 'results' ? 'hidden lg:block' : 'block'}>
            <CheckerInputCard
              onVerify={handleRunVerify}
              isLoading={analyzeMutation.isPending}
              initialQuestion={currentReport?.question || ''}
              initialAnswer={currentReport?.answer || ''}
            />
          </div>

          {/* Running Stepper Progress */}
          {analyzeMutation.isPending && <RunningStepper />}

          {/* Error State */}
          {analyzeMutation.isError && (
            <div className="my-8 p-6 rounded border border-verdict-contra/40 bg-verdict-contra-surface text-center space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-verdict-contra">
                Audit Pipeline Interrupted
              </h3>
              <p className="text-ink-muted max-w-md mx-auto font-sans text-xs">
                {analyzeMutation.error?.message || 'An error occurred during verification.'}
              </p>
              <div className="pt-2">
                <Button variant="danger" size="sm" onClick={handleRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                  Retry Audit
                </Button>
              </div>
            </div>
          )}

          {/* Results Dashboard: Hidden on mobile when on input tab */}
          {!analyzeMutation.isPending && currentReport && (
            <div className={mobileTab === 'input' ? 'hidden lg:block' : 'block'}>
              <ResultsDashboard
                report={currentReport}
                onReset={() => {
                  setCurrentReport(null);
                  setMobileTab('input');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Checker;
