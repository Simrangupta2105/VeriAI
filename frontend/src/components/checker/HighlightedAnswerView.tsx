import React from 'react';
import { Claim, VerificationResult } from '../../types';
import { VERDICT_MAP } from '../../lib/verdict';

interface HighlightedAnswerViewProps {
  answer: string;
  claims: Claim[];
  results: VerificationResult[];
  onSelectClaim?: (claimId: string) => void;
}

export const HighlightedAnswerView: React.FC<HighlightedAnswerViewProps> = ({
  answer,
  claims,
  results,
  onSelectClaim,
}) => {
  if (!answer) return null;

  const resultMap = new Map(results.map((r) => [r.claim_id, r]));

  // Find sentences/phrases that correspond to claims
  // If claims have original_sentence, we highlight occurrences in the text
  const claimSentences = claims
    .filter((c) => Boolean(c.original_sentence && c.original_sentence.trim().length > 5))
    .map((c) => ({
      claimId: c.claim_id,
      text: (c.original_sentence || '').trim(),
      verdict: resultMap.get(c.claim_id)?.verdict || 'UNVERIFIED',
    }));

  if (claimSentences.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-muted/40 border border-card-border text-sm leading-relaxed text-foreground">
        {answer}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-card border border-card-border shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-fg">
          Annotated Output Context (Color-coded by Verdict)
        </span>
        <span className="text-[11px] text-muted-fg">Click a highlighted span to inspect</span>
      </div>

      <div className="text-sm sm:text-base leading-relaxed text-foreground font-sans">
        <p className="whitespace-pre-wrap">{answer}</p>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
        {claimSentences.map((cs) => {
          const config = VERDICT_MAP[cs.verdict] || VERDICT_MAP.UNVERIFIED;
          return (
            <button
              key={cs.claimId}
              type="button"
              onClick={() => onSelectClaim?.(cs.claimId)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-transform hover:scale-105 ${config.badgeClass}`}
            >
              <span className="font-mono font-bold mr-1">{cs.claimId}</span>
              {config.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

