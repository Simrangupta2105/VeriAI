import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { useAudits } from '../hooks/useVeriApi';
import { AuditSummary } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Search, ArrowUpRight, ArrowUpDown } from 'lucide-react';

export const Audits: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'reliability' | 'risk'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { data: audits, isLoading, isError, refetch } = useAudits(50);

  const filteredAudits = (audits || []).filter((audit: AuditSummary) => {
    const q = (audit.question || '').toLowerCase();
    const a = (audit.answer || '').toLowerCase();
    const id = (audit.report_id || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return q.includes(search) || a.includes(search) || id.includes(search);
  });

  filteredAudits.sort((a: AuditSummary, b: AuditSummary) => {
    if (sortBy === 'reliability') {
      return sortOrder === 'desc'
        ? b.overall_reliability - a.overall_reliability
        : a.overall_reliability - b.overall_reliability;
    }
    if (sortBy === 'risk') {
      return sortOrder === 'desc'
        ? b.hallucination_risk - a.hallucination_risk
        : a.hallucination_risk - b.hallucination_risk;
    }
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-rule">
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-teal block">
              Reference Registry • Local SQLite Store
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Audit Records Archive
            </h1>
            <p className="text-sm text-ink-muted max-w-xl font-sans">
              Locally persisted audit trails with claim breakdowns, confidence metrics, and evidence traces.
            </p>
          </div>

          <Link to="/check">
            <Button size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              New Audit
            </Button>
          </Link>
        </div>

        {/* Search & Sort Toolbar */}
        <Card className="p-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword, report identifier, or prompt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded border border-rule bg-surface text-ink focus:outline-none focus:border-teal"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-ink-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded border border-rule bg-surface px-2.5 py-1 text-ink focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="reliability">Corroboration Index</option>
              <option value="risk">Discrepancy Risk</option>
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
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="p-8 text-center space-y-3 bg-surface border-rule font-mono text-xs">
            <p className="text-verdict-contra font-semibold">
              Failed to query SQLite audit database.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </Card>
        )}

        {/* List of Audits */}
        {!isLoading && !isError && (
          <div className="space-y-3 font-mono">
            {filteredAudits.map((audit: AuditSummary) => {
              const rel = Math.round(audit.overall_reliability);
              const risk = Math.round(audit.hallucination_risk);

              return (
                <Link
                  key={audit.report_id}
                  to={`/audits/${audit.report_id}`}
                  className="block group"
                >
                  <Card hoverLift className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-ink px-1.5 py-0.2 rounded bg-surface-subtle border border-rule">
                            {audit.report_id}
                          </span>
                          <span className="text-ink-muted text-[11px]">
                            {new Date(audit.created_at).toLocaleDateString()} {new Date(audit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {audit.model_name && (
                            <span className="text-ink-muted text-[10px] hidden sm:inline">
                              [{audit.model_name}]
                            </span>
                          )}
                        </div>

                        <h3 className="font-sans font-bold text-sm text-ink group-hover:text-teal transition-colors line-clamp-1">
                          {audit.question}
                        </h3>

                        <p className="font-sans text-xs text-ink-muted line-clamp-1">
                          {audit.answer}
                        </p>
                      </div>

                      {/* Right metrics */}
                      <div className="flex items-center gap-5 shrink-0 sm:border-l sm:border-rule sm:pl-5 text-right">
                        <div>
                          <span className="text-[9px] uppercase text-ink-muted block">Corroborated</span>
                          <span className="font-bold text-sm text-ink">{rel}/100</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-ink-muted block">Risk</span>
                          <span className="font-bold text-sm text-verdict-contra">{risk}%</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-teal transition-colors" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}

            {filteredAudits.length === 0 && (
              <Card className="p-12 text-center space-y-3 font-mono text-xs text-ink-muted">
                <p>No audit records located matching current filter.</p>
                <Link to="/check">
                  <Button size="sm">Open Audit Desk</Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Audits;
