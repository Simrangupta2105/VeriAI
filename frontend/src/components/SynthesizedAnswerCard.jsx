import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle, Info, Copy, Check } from 'lucide-react';

export default function SynthesizedAnswerCard({ answer, metrics, confidence, question }) {
  const [copied, setCopied] = React.useState(false);

  if (!answer) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceBadge = (conf) => {
    switch (conf) {
      case 'HIGH CONFIDENCE':
        return {
          label: 'High System Confidence',
          desc: 'Consensus across models with authoritative external corroboration',
          color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          icon: ShieldCheck,
        };
      case 'MEDIUM CONFIDENCE':
        return {
          label: 'Medium System Confidence',
          desc: 'Evidence exists but partial discrepancies or limited sources detected',
          color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          icon: Info,
        };
      case 'LOW CONFIDENCE':
        return {
          label: 'Low System Confidence',
          desc: 'Active cross-model disagreements or contested evidence identified',
          color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
          icon: AlertTriangle,
        };
      default:
        return {
          label: 'Unverified Status',
          desc: 'Insufficient external evidence to establish validation',
          color: 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-400 border-gray-200 dark:border-slate-700',
          icon: Info,
        };
    }
  };

  const confBadge = getConfidenceBadge(metrics?.overall_confidence || confidence || 'MEDIUM CONFIDENCE');
  const ConfIcon = confBadge.icon;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with confidence & hallucination metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-700 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight">Evidence-Backed Synthesized Answer</h3>
            <span className="text-xs text-gray-600 dark:text-slate-400 font-mono">Cross-referenced against external records</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            title={confBadge.desc}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${confBadge.color}`}
          >
            <ConfIcon className="w-3.5 h-3.5" />
            <span>{confBadge.label}</span>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 transition-colors"
            title="Copy answer"
          >
            {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hallucination / Verification Metric Bar */}
      {metrics && metrics.total_claims > 0 && (
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700 dark:text-slate-300 font-medium">
              Factual Grounding: <strong className="text-gray-900 dark:text-slate-100">{metrics.summary_statement}</strong>
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{metrics.support_ratio}% supported</span>
          </div>

          {/* Dual visual progress bar */}
          <div className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${metrics.support_ratio || 0}%` }}
              className="bg-green-500 dark:bg-green-500 h-full transition-all duration-500"
              title={`Supported: ${metrics.supported}`}
            />
            <div
              style={{ width: `${metrics.contradiction_ratio || 0}%` }}
              className="bg-red-500 dark:bg-red-500 h-full transition-all duration-500"
              title={`Contradicted: ${metrics.contradicted}`}
            />
            <div
              style={{
                width: `${
                  100 - (metrics.support_ratio || 0) - (metrics.contradiction_ratio || 0)
                }%`,
              }}
              className="bg-amber-500 dark:bg-amber-500 h-full transition-all duration-500"
              title={`Uncertain/Pending: ${metrics.uncertain + (metrics.not_verifiable || 0)}`}
            />
          </div>

          <p className="text-[11px] text-gray-600 dark:text-slate-400 italic">
            * {metrics.calculation_note}
          </p>
        </div>
      )}

      {/* Formatted Synthesized Text */}
      <div className="text-sm sm:text-base text-gray-800 dark:text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none whitespace-pre-wrap">
        {answer}
      </div>
    </div>
  );
}
