export type ClaimType =
  | 'historical'
  | 'scientific'
  | 'numerical'
  | 'geographic'
  | 'financial'
  | 'political'
  | 'technical'
  | 'biographical'
  | 'medical'
  | 'temporal'
  | 'opinion'
  | 'definition'
  | 'mathematical'
  | 'other';

export type VerdictType =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTRADICTED'
  | 'UNVERIFIED'
  | 'NOT_FACTUAL';

export interface Claim {
  claim_id: string;
  claim: string;
  claim_type: ClaimType;
  importance: number;
  requires_verification: boolean;
  original_sentence?: string | null;
}

export interface EvidenceItem {
  evidence_id: string;
  claim_id: string;
  source_title: string;
  source_url: string;
  source_domain: string;
  source_type: string; // primary, government, academic, news, reference, general
  snippet: string;
  relevance: number;
  source_quality_score: number;
  quality_explanation?: string;
  retrieved_at: string;
}

export interface VerificationResult {
  claim_id: string;
  verdict: VerdictType;
  confidence: number;
  reason: string;
  evidence_ids: string[];
  source_quality_avg: number;
  critic_status: 'PASSED' | 'REVISED' | 'FLAGGED' | string;
  critic_notes?: string | null;
  discrepancy_details?: Record<string, any> | null;
}

export interface SummaryCounts {
  total: number;
  supported: number;
  partially_supported: number;
  contradicted: number;
  unverified: number;
  not_factual: number;
}

export interface VerificationReport {
  report_id: string;
  question: string;
  answer: string;
  model_name: string;
  created_at: string;
  overall_reliability: number;
  hallucination_risk: number;
  score_calculation_breakdown: Record<string, any>;
  summary_counts: SummaryCounts;
  claims: Claim[];
  evidence: EvidenceItem[];
  results: VerificationResult[];
  explanation: string;
}

export interface GenerateRequest {
  question: string;
  model?: string;
  temperature?: number;
}

export interface GenerateResponse {
  question: string;
  answer: string;
  model: string;
  created_at: string;
}

export interface AnalyzeRequest {
  question: string;
  answer: string;
  model_name?: string;
  enable_critic?: boolean;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  default_model: string;
  database: string;
  critic_enabled: boolean;
  llm_configured: boolean;
}

export interface AuditSummary {
  report_id: string;
  question: string;
  answer: string;
  model_name?: string;
  created_at: string;
  overall_reliability: number;
  hallucination_risk: number;
  summary_counts: SummaryCounts;
}

