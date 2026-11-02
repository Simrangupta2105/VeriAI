import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import { AnalyzeRequest, GenerateRequest, VerificationReport } from '../types';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
    retry: 2,
  });
}

export function useAudits(limit: number = 30) {
  return useQuery({
    queryKey: ['audits', limit],
    queryFn: () => api.listAudits(limit),
  });
}

export function useAudit(reportId?: string) {
  return useQuery({
    queryKey: ['audit', reportId],
    queryFn: () => (reportId ? api.getAudit(reportId) : Promise.reject('No ID')),
    enabled: Boolean(reportId),
  });
}

export function useGenerateAnswer() {
  return useMutation({
    mutationFn: (data: GenerateRequest) => api.generateAnswer(data),
  });
}

export function useAnalyze() {
  const queryClient = useQueryClient();
  return useMutation<VerificationReport, ApiError, AnalyzeRequest>({
    mutationFn: (data: AnalyzeRequest) => api.analyzeText(data),
    onSuccess: (newReport) => {
      // Invalidate audits list so new analysis immediately appears in history
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.setQueryData(['audit', newReport.report_id], newReport);
    },
  });
}

export function useReportDownload() {
  const downloadJson = (report: VerificationReport) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veriai-audit-${report.report_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyTextAudit = async (reportId: string): Promise<string> => {
    const res = await api.getAuditText(reportId);
    await navigator.clipboard.writeText(res.text_summary);
    return res.text_summary;
  };

  return { downloadJson, copyTextAudit };
}

