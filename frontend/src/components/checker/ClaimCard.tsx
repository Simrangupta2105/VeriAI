import React, { useState } from 'react';
import { Claim, EvidenceItem, VerificationResult } from '../../types';
import { Card } from '../ui/Card';
import { VerdictTag } from '../ui/Badge';
import { VERDICT_MAP } from '../../lib/verdict';
import { ExternalLink, ChevronDown, ChevronUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ClaimCardProps {
  claim: Claim;
  result?: VerificationResult;
  evidence: EvidenceItem[];
  isHighlighted?: boolean;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  result,
  evidence,
  isHighlighted = false,
}) => {
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  const verdict = result?.verdict || 'UNVERIFIED';
  const config = VERDICT_MAP[verdict] || VERDICT_MAP.UNVERIFIED;

  // Evidence linked to this claim
  const linkedEvidence = evidence.filter(
    (ev) => ev.claim_id === claim.claim_id || (result?.evidence_ids || []).includes(ev.evidence_id)
  );

  return (
    <Card
      id={`claim-${claim.claim_id}`}
      hoverLift
      className={`p-5 sm:p-6 transition-all duration-150 ${
        isHighlighted ? 'ring-1 ring-teal border-teal' : ''
      }`}
    >
      {/* Header Row: Claim ID, Domain Tag, Importance, Verdict Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-rule">
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <span className="font-bold text-ink px-1.5 py-0.5 rounded bg-surface-subtle border border-rule">
            {claim.claim_id}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-ink-muted px-1.5 py-0.5 rounded border border-rule">
            {claim.claim_type}
          </span>
          <span className="text-ink-muted text-[11px]">
            Importance: <strong className="text-ink">{claim.importance}</strong>
          </span>
        </div>

        <VerdictTag verdict={verdict} />
      </div>

      {/* Proposition Prose */}
      <div className="font-display text-base sm:text-lg font-bold text-ink mb-4 leading-snug">
        "{claim.claim}"
      </div>

      {/* Metrics Row: Confidence, Avg Source Quality, Critic Status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded bg-surface-subtle border border-rule font-mono text-xs mb-4">
        <div>
          <span className="text-ink-muted block text-[10px] uppercase">Confidence</span>
          <span className="font-bold text-ink">
            {Math.round((result?.confidence || 0.5) * 100)}%
          </span>
        </div>

        <div>
          <span className="text-ink-muted block text-[10px] uppercase">Source Provenance</span>
          <span className="font-bold text-ink">
            {Math.round(result?.source_quality_avg || 0)}/100
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-ink-muted block text-[10px] uppercase">Critic Review</span>
          <span
            className={`font-semibold inline-flex items-center gap-1 ${
              result?.critic_status === 'REVISED'
                ? 'text-verdict-partial'
                : 'text-verdict-supported'
            }`}
          >
            {result?.critic_status === 'REVISED' ? (
              <ShieldAlert className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            {result?.critic_status || 'PASSED'}
          </span>
        </div>
      </div>

      {/* Audit Rationale */}
      <div className={`p-4 rounded text-xs border leading-relaxed mb-4 ${config.bgClass} ${config.borderClass}`}>
        <div className="font-mono text-[10px] uppercase font-bold text-ink mb-1">
          Desk Audit Rationale
        </div>
        <p className="text-ink font-sans leading-relaxed">{result?.reason || 'Evaluation completed against reference corpus.'}</p>

        {result?.critic_notes && (
          <div className="mt-2 pt-2 border-t border-rule/50 font-mono text-[11px] text-ink-muted">
            <strong>Critic Audit:</strong> {result.critic_notes}
          </div>
        )}

        {result?.discrepancy_details && (
          <div className="mt-2 font-mono text-[11px] p-2 rounded bg-surface border border-rule text-ink">
            <strong>Discrepancy:</strong> {JSON.stringify(result.discrepancy_details)}
          </div>
        )}
      </div>

      {/* Collapsible Evidence List */}
      {linkedEvidence.length > 0 && (
        <div className="border-t border-rule pt-3">
          <button
            type="button"
            onClick={() => setEvidenceOpen(!evidenceOpen)}
            className="w-full flex items-center justify-between font-mono text-[11px] text-ink-muted hover:text-ink uppercase tracking-wider py-1 select-none"
          >
            <span>Corroborating Citations ({linkedEvidence.length})</span>
            {evidenceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {evidenceOpen && (
            <div className="mt-2.5 space-y-2">
              {linkedEvidence.map((ev) => (
                <div
                  key={ev.evidence_id}
                  className="p-3 rounded border border-rule bg-surface text-xs space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-teal hover:underline inline-flex items-center gap-1"
                    >
                      <span>{ev.source_title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] text-ink-muted">
                      Quality: {ev.source_quality_score}/100 • {ev.source_type}
                    </span>
                  </div>

                  <p className="text-ink-muted italic text-xs leading-relaxed border-l-2 border-teal/40 pl-2.5 font-sans">
                    "{ev.snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
