import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { useAudit } from '../hooks/useVeriApi';
import { ResultsDashboard } from '../components/checker/ResultsDashboard';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError } = useAudit(id);

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/audits"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-fg hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Audit History
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="p-12 text-center space-y-4 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-rose-900 dark:text-rose-100">
              Audit Not Found
            </h2>
            <p className="text-xs text-rose-700 dark:text-rose-300 max-w-sm mx-auto">
              Could not find audit report with ID '{id}'. It may have been removed or never created.
            </p>
            <Link to="/audits">
              <Button variant="outline" size="sm">
                Return to History
              </Button>
            </Link>
          </Card>
        )}

        {/* Success */}
        {!isLoading && !isError && report && (
          <ResultsDashboard report={report} />
        )}
      </div>
    </PageContainer>
  );
};

export default AuditDetail;
