import React, { useState } from 'react';
import { VerificationReport, VerdictType } from '../../types';
import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';
import { Button } from '../ui/Button';
import { ClaimCard } from './ClaimCard';
import { AnnotatedText, TextAnnotation } from '../ui/AnnotatedText';
import { VERDICT_MAP } from '../../lib/verdict';
import { useReportDownload } from '../../hooks/useVeriApi';
import { Toast } from '../ui/Toast';
import { Copy, Download, ArrowUpDown, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface ResultsDashboardProps {
  report: VerificationReport;
  onReset?: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ report, onReset }) => {
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'importance' | 'confidence'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { downloadJson, copyTextAudit } = useReportDownload();

  const handleCopyText = async () => {
    try {
      await copyTextAudit(report.report_id);
      setToastMessage('Audit report transcript copied to clipboard.');
    } catch {
      setToastMessage('Failed to copy audit transcript.');
    }
  };

  const counts = report.summary_counts || {
    total: report.claims.length,
    supported: 0,
    partially_supported: 0,
    contradicted: 0,
    unverified: 0,
    not_factual: 0,
  };

  const resultMap = new Map(report.results.map((r) => [r.claim_id, r]));

  // Build annotations for AnnotatedText proofread view
  const documentAnnotations: TextAnnotation[] = report.claims.map((c) => {
    const res = resultMap.get(c.claim_id);
    const firstEv = report.evidence.find(
      (e) => (res?.evidence_ids || []).includes(e.evidence_id) || e.claim_id === c.claim_id
    );
    return {
      id: c.claim_id,
      spanText: (c.original_sentence || c.claim).trim(),
      verdict: res?.verdict || 'UNVERIFIED',
      note: res?.reason,
      citation: firstEv?.source_title,
    };
  });

  // Filter claims
  let filteredClaims = report.claims.filter((c) => {
    if (selectedVerdict === 'ALL') return true;
    const res = resultMap.get(c.claim_id);
    const v = res ? res.verdict : 'UNVERIFIED';
    return v === selectedVerdict;
  });

  // Sort claims
  filteredClaims.sort((a, b) => {
    if (sortBy === 'importance') {
      return sortOrder === 'desc' ? b.importance - a.importance : a.importance - b.importance;
    }
    if (sortBy === 'confidence') {
      const cA = resultMap.get(a.claim_id)?.confidence || 0;
      const cB = resultMap.get(b.claim_id)?.confidence || 0;
      return sortOrder === 'desc' ? cB - cA : cA - cB;
    }
    return sortOrder === 'desc' ? b.claim_id.localeCompare(a.claim_id) : a.claim_id.localeCompare(b.claim_id);
  });

  const scrollToClaim = (claimId: string) => {
    setHighlightedClaimId(claimId);
    const element = document.getElementById(`claim-${claimId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-8 my-8">
      {/* Top Ledger Header: Report ID, Model, Date, Actions */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-rule">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-subtle text-ink border border-rule">
              {report.report_id}
            </span>
            <span className="font-mono text-xs text-ink-muted">
              Model: <strong className="text-ink">{report.model_name}</strong>
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="font-mono text-xs text-ink-muted">
              {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyText} icon={<Copy className="w-3.5 h-3.5" />}>
              Copy Audit Transcript
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadJson(report)} icon={<Download className="w-3.5 h-3.5" />}>
              Export JSON
            </Button>
            {onReset && (
              <Button variant="secondary" size="sm" onClick={onReset}>
                New Audit
              </Button>
            )}
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted block">
            Target Inquiry / Proposition Context
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mt-0.5">
            {report.question}
          </h2>
        </div>
      </Card>

      {/* Semicircle Gauge & Verdict Totals Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Flat Semicircle Gauge */}
        <Card className="lg:col-span-4 p-6 flex flex-col items-center justify-center text-center">
          <Gauge value={report.overall_reliability} size={220} label="Evidence Corroboration Index" />
          <p className="font-sans text-xs text-ink-muted max-w-xs mt-3 leading-relaxed">
            Deterministic index derived from atomic proposition importance, retrieval confidence, and publisher provenance.
          </p>
        </Card>

        {/* Right: Discrepancy Risk & Verdict Counts */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 border-l-4 border-l-verdict-contra flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                Estimated Discrepancy & Hallucination Risk
              </span>
              <div className="font-mono text-3xl font-bold text-ink mt-1">
                {report.hallucination_risk}%
              </div>
              <p className="text-xs text-ink-muted mt-1 font-sans">
                Penalizes explicit temporal mismatches, factual contradictions, and ghost citations.
              </p>
            </div>
            <div className="font-mono text-xs px-2.5 py-1 rounded border border-rule bg-surface-subtle text-ink">
              {report.hallucination_risk <= 15 ? 'Low Discrepancy' : report.hallucination_risk <= 30 ? 'Moderate Discrepancy' : 'High Discrepancy'}
            </div>
          </Card>

          {/* 4 Verdict Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 rounded border border-verdict-supported/30 bg-verdict-supported-surface">
              <div className="flex items-center gap-1.5 text-verdict-supported text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Supported</span>
              </div>
              <div className="text-2xl font-bold text-verdict-supported mt-1.5">
                {counts.supported || 0}
              </div>
            </div>

            <div className="p-3.5 rounded border border-verdict-contra/30 bg-verdict-contra-surface">
              <div className="flex items-center gap-1.5 text-verdict-contra text-xs font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Refuted</span>
              </div>
              <div className="text-2xl font-bold text-verdict-contra mt-1.5">
                {counts.contradicted || 0}
              </div>
            </div>

            <div className="p-3.5 rounded border border-verdict-partial/30 bg-verdict-partial-surface">
              <div className="flex items-center gap-1.5 text-verdict-partial text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Partial</span>
              </div>
              <div className="text-2xl font-bold text-verdict-partial mt-1.5">
                {counts.partially_supported || 0}
              </div>
            </div>

            <div className="p-3.5 rounded border border-verdict-unverified/30 bg-verdict-unverified-surface">
              <div className="flex items-center gap-1.5 text-verdict-unverified text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Unverified</span>
              </div>
              <div className="text-2xl font-bold text-verdict-unverified mt-1.5">
                {counts.unverified || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Proofread Document Component */}
      <div className="space-y-3">
        <span className="font-mono text-xs uppercase tracking-wider text-ink-muted block font-semibold">
          Proofread Context Document
        </span>
        <AnnotatedText
          text={report.answer}
          annotations={documentAnnotations}
          selectedId={highlightedClaimId}
          onSelect={scrollToClaim}
        />
      </div>

      {/* Filtering & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-rule font-mono">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedVerdict('ALL')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              selectedVerdict === 'ALL'
                ? 'bg-ink text-background border-ink font-semibold'
                : 'bg-surface text-ink-muted border-rule hover:text-ink'
            }`}
          >
            All Claims ({report.claims.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedVerdict('CONTRADICTED')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              selectedVerdict === 'CONTRADICTED'
                ? 'bg-verdict-contra text-white border-verdict-contra font-semibold'
                : 'bg-verdict-contra-surface text-verdict-contra border-verdict-contra/30'
            }`}
          >
            Refuted ({counts.contradicted || 0})
          </button>

          <button
            type="button"
            onClick={() => setSelectedVerdict('SUPPORTED')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              selectedVerdict === 'SUPPORTED'
                ? 'bg-verdict-supported text-white border-verdict-supported font-semibold'
                : 'bg-verdict-supported-surface text-verdict-supported border-verdict-supported/30'
            }`}
          >
            Supported ({counts.supported || 0})
          </button>

          <button
            type="button"
            onClick={() => setSelectedVerdict('PARTIALLY_SUPPORTED')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              selectedVerdict === 'PARTIALLY_SUPPORTED'
                ? 'bg-verdict-partial text-white border-verdict-partial font-semibold'
                : 'bg-verdict-partial-surface text-verdict-partial border-verdict-partial/30'
            }`}
          >
            Partial ({counts.partially_supported || 0})
          </button>

          <button
            type="button"
            onClick={() => setSelectedVerdict('UNVERIFIED')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              selectedVerdict === 'UNVERIFIED'
                ? 'bg-ink text-white border-ink font-semibold'
                : 'bg-surface-subtle text-ink-muted border-rule'
            }`}
          >
            Unverified ({counts.unverified || 0})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-ink-muted">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded border border-rule bg-surface px-2 py-1 text-ink focus:outline-none"
          >
            <option value="id">Claim Code</option>
            <option value="importance">Importance</option>
            <option value="confidence">Confidence</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 rounded border border-rule bg-surface text-ink-muted hover:text-ink"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Claim Cards Ledger Feed */}
      <div className="space-y-4">
        {filteredClaims.map((claim) => (
          <ClaimCard
            key={claim.claim_id}
            claim={claim}
            result={resultMap.get(claim.claim_id)}
            evidence={report.evidence}
            isHighlighted={highlightedClaimId === claim.claim_id}
          />
        ))}

        {filteredClaims.length === 0 && (
          <Card className="p-8 text-center text-xs font-mono text-ink-muted">
            No propositions match verdict filter '{selectedVerdict}'.
          </Card>
        )}
      </div>

      <Toast
        isOpen={Boolean(toastMessage)}
        message={toastMessage || ''}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
