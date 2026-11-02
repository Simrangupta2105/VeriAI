import {
  HealthResponse,
  GenerateRequest,
  GenerateResponse,
  AnalyzeRequest,
  VerificationReport,
  AuditSummary,
} from '../types';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      let errorData = null;
      try {
        errorData = await res.json();
        if (errorData?.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // ignore parse error
      }
      throw new ApiError(errorMsg, res.status, errorData);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Network error connecting to VeriAI backend', 0);
  }
}

export const api = {
  getHealth: () => request<HealthResponse>('/api/health'),

  generateAnswer: (data: GenerateRequest) =>
    request<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  analyzeText: (data: AnalyzeRequest) =>
    request<VerificationReport>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listAudits: (limit: number = 25) =>
    request<AuditSummary[]>(`/api/reports?limit=${limit}`),

  getAudit: (reportId: string) =>
    request<VerificationReport>(`/api/reports/${reportId}`),

  getAuditText: (reportId: string) =>
    request<{ report_id: string; text_summary: string }>(`/api/reports/${reportId}/text`),
};

