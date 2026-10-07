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
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: ShieldCheck,
        };
      case 'MEDIUM CONFIDENCE':
        return {
          label: 'Medium System Confidence',
          desc: 'Evidence exists but partial discrepancies or limited sources detected',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Info,
        };
      case 'LOW CONFIDENCE':
        return {
          label: 'Low System Confidence',
          desc: 'Active cross-model disagreements or contested evidence identified',
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: AlertTriangle,
        };
      default:
        return {
          label: 'Unverified Status',
          desc: 'Insufficient external evidence to establish validation',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: Info,
        };
    }
  };

  const confBadge = getConfidenceBadge(metrics?.overall_confidence || confidence || 'MEDIUM CONFIDENCE');
  const ConfIcon = confBadge.icon;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with confidence & hallucination metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Evidence-Backed Synthesized Answer</h3>
            <span className="text-xs text-gray-600 font-mono">Cross-referenced against external records</span>
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
            className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 bg-white transition-colors"
            title="Copy answer"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hallucination / Verification Metric Bar */}
      {metrics && metrics.total_claims > 0 && (
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">
              Factual Grounding: <strong className="text-gray-900">{metrics.summary_statement}</strong>
            </span>
            <span className="font-mono text-blue-600 font-semibold">{metrics.support_ratio}% supported</span>
          </div>

          {/* Dual visual progress bar */}
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${metrics.support_ratio || 0}%` }}
              className="bg-green-500 h-full transition-all duration-500"
              title={`Supported: ${metrics.supported}`}
            />
            <div
              style={{ width: `${metrics.contradiction_ratio || 0}%` }}
              className="bg-red-500 h-full transition-all duration-500"
              title={`Contradicted: ${metrics.contradicted}`}
            />
            <div
              style={{
                width: `${
                  100 - (metrics.support_ratio || 0) - (metrics.contradiction_ratio || 0)
                }%`,
              }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Uncertain/Pending: ${metrics.uncertain + (metrics.not_verifiable || 0)}`}
            />
          </div>

          <p className="text-[11px] text-gray-600 italic">
            * {metrics.calculation_note}
          </p>
        </div>
      )}

      {/* Formatted Synthesized Text */}
      <div className="text-sm sm:text-base text-gray-800 leading-relaxed font-sans prose prose-invert max-w-none whitespace-pre-wrap">
        {answer}
      </div>
    </div>
  );
}
