from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class ClaimType(str, Enum):
    HISTORICAL = "historical"
    SCIENTIFIC = "scientific"
    NUMERICAL = "numerical"
    GEOGRAPHIC = "geographic"
    FINANCIAL = "financial"
    POLITICAL = "political"
    TECHNICAL = "technical"
    BIOGRAPHICAL = "biographical"
    MEDICAL = "medical"
    TEMPORAL = "temporal"
    OPINION = "opinion"
    DEFINITION = "definition"
    MATHEMATICAL = "mathematical"
    OTHER = "other"


class VerdictType(str, Enum):
    SUPPORTED = "SUPPORTED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    CONTRADICTED = "CONTRADICTED"
    UNVERIFIED = "UNVERIFIED"
    NOT_FACTUAL = "NOT_FACTUAL"


class Claim(BaseModel):
    claim_id: str
    claim: str
    claim_type: ClaimType = ClaimType.OTHER
    importance: float = Field(default=0.8, ge=0.0, le=1.0)
    requires_verification: bool = True
    original_sentence: Optional[str] = None


class NormalizedClaim(BaseModel):
    claim_id: str
    original_claim: str
    search_query: str
    alternative_queries: List[str] = []
    entities: List[str] = []
    temporal_anchor: Optional[str] = None
    numerical_values: List[str] = []


class EvidenceItem(BaseModel):
    evidence_id: str
    claim_id: str
    source_title: str
    source_url: str
    source_domain: str
    source_type: str = "general"  # primary, government, academic, news, reference, general
    snippet: str
    relevance: float = Field(default=0.8, ge=0.0, le=1.0)
    source_quality_score: float = Field(default=50.0, ge=0.0, le=100.0)
    quality_explanation: str = ""
    retrieved_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class VerificationResult(BaseModel):
    claim_id: str
    verdict: VerdictType
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    reason: str
    evidence_ids: List[str] = []
    source_quality_avg: float = 0.0
    critic_status: str = "PASSED"  # PASSED, REVISED, FLAGGED
    critic_notes: Optional[str] = None
    discrepancy_details: Optional[Dict[str, Any]] = None


class VerificationReport(BaseModel):
    report_id: str
    question: str
    answer: str
    model_name: str = "default"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    overall_reliability: float = 0.0  # 0 to 100
    hallucination_risk: float = 0.0   # 0 to 100
    score_calculation_breakdown: Dict[str, Any] = {}
    summary_counts: Dict[str, int] = {
        "total": 0,
        "supported": 0,
        "partially_supported": 0,
        "contradicted": 0,
        "unverified": 0,
        "not_factual": 0,
    }
    claims: List[Claim] = []
    evidence: List[EvidenceItem] = []
    results: List[VerificationResult] = []
    explanation: str = ""


# API Request and Response Models
class GenerateRequest(BaseModel):
    question: str
    model: Optional[str] = None
    temperature: Optional[float] = 0.2


class GenerateResponse(BaseModel):
    question: str
    answer: str
    model: str
    created_at: str


class AnalyzeRequest(BaseModel):
    question: str
    answer: str
    model_name: Optional[str] = "custom-input"
    enable_critic: Optional[bool] = True


class ExtractClaimsRequest(BaseModel):
    answer: str
    question: Optional[str] = None


class ExtractClaimsResponse(BaseModel):
    claims: List[Claim]


class VerifyClaimRequest(BaseModel):
    claim: Claim
    question: Optional[str] = None
