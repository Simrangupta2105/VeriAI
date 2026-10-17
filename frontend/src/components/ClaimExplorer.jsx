import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function ClaimExplorer({ claims }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedClaimId, setExpandedClaimId] = useState(null);

  if (!claims || claims.length === 0) return null;

  const filteredClaims = claims.filter((c) => {
    if (filter === 'ALL') return true;
    return c.verification_status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUPPORTED':
        return {
          label: 'Supported',
          color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          icon: CheckCircle2,
        };
      case 'CONTRADICTED':
        return {
          label: 'Contradicted',
          color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse',
          icon: XCircle,
        };
      case 'UNCERTAIN':
        return {
          label: 'Uncertain',
          color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'Not Verifiable',
          color: 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-400 border-gray-200 dark:border-slate-700',
          icon: HelpCircle,
        };
    }
  };

  const counts = {
    ALL: claims.length,
    SUPPORTED: claims.filter((c) => c.verification_status === 'SUPPORTED').length,
    CONTRADICTED: claims.filter((c) => c.verification_status === 'CONTRADICTED').length,
    UNCERTAIN: claims.filter((c) => c.verification_status === 'UNCERTAIN').length,
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-700 pb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Claim-Level Verification Explorer</span>
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
            Atomic propositions cross-checked against authoritative external evidence
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400 mr-1 shrink-0" />
          {[
            { id: 'ALL', label: 'All', count: counts.ALL },
            { id: 'SUPPORTED', label: 'Supported', count: counts.SUPPORTED },
            { id: 'CONTRADICTED', label: 'Contradicted', count: counts.CONTRADICTED },
            { id: 'UNCERTAIN', label: 'Uncertain', count: counts.UNCERTAIN },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filter === f.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{f.label}</span>
              <span className="ml-1.5 opacity-60 font-mono text-[10px]">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-2.5">
        {filteredClaims.map((claim) => {
          const badge = getStatusBadge(claim.verification_status);
          const StatusIcon = badge.icon;
          const isExpanded = expandedClaimId === claim.id;

          return (
            <div
              key={claim.id}
              className={`rounded-lg border transition-all ${
                claim.verification_status === 'CONTRADICTED'
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <div
                onClick={() => setExpandedClaimId(isExpanded ? null : claim.id)}
                className="p-3.5 cursor-pointer flex items-start justify-between gap-3 select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-[11px] text-gray-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                      Claim by: <span className="text-gray-900 dark:text-slate-100 font-semibold">{claim.source_model}</span>
                    </span>

                    {claim.confidence_level && (
                      <span className="text-[10px] text-gray-600 dark:text-slate-400 font-mono">
                        [{claim.confidence_level}]
                      </span>
                    )}

                    {claim.models_contradicting && claim.models_contradicting.length > 0 && (
                      <span className="inline-flex items-center space-x-1 text-[11px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Contested by: {claim.models_contradicting.join(', ')}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 leading-snug">
                    "{claim.normalized_claim}"
                  </p>
                </div>

                <div className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Detailed Breakdown when expanded */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-200 dark:border-slate-700 space-y-3 text-xs bg-white dark:bg-slate-900">
                  {/* System Explanation */}
                  {claim.explanation && (
                    <div className="p-2.5 rounded-md bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                      <span className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">Verification Rationale:</span>
                      <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{claim.explanation}</p>
                    </div>
                  )}

                  {/* Contradicting Evidence Alert */}
                  {claim.contradicting_evidence && claim.contradicting_evidence.length > 0 && (
                    <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 space-y-1.5">
                      <div className="flex items-center space-x-1.5 font-semibold text-red-800 dark:text-red-300">
                        <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0" />
                        <span>Conflicting Authoritative Evidence:</span>
                      </div>
                      {claim.contradicting_evidence.map((ev, i) => (
                        <div key={i} className="pl-5 space-y-1">
                          <p className="italic text-red-600 dark:text-red-400">"{ev.passage}"</p>
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                          >
                            <span>Source: {ev.title} ({ev.domain})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supporting Evidence */}
                  {claim.supporting_evidence && claim.supporting_evidence.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-semibold text-gray-700 dark:text-slate-300">Consulted External Records:</span>
                      {claim.supporting_evidence.map((ev, i) => (
                        <div key={i} className="p-2.5 rounded bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-slate-100">{ev.title}</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              Auth Score: {ev.authority_score}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-slate-400 line-clamp-3">"{ev.passage}"</p>
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline text-[11px]"
                          >
                            <span>{ev.domain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
