# VeriAI Backend API Contract & Specification

This document details the exact REST API contract of the FastAPI backend for **VeriAI** (`backend/app`).

---

## 1. System Health Check

### `GET /api/health`
Checks whether the backend service is up and returns configuration metadata.

- **Request Headers**: None
- **Request Body**: None
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
{
  "status": "healthy",
  "service": "ai-hallucination-detector",
  "version": "1.0.0",
  "default_model": "hybrid-verifier-v1",
  "database": "C:\\Users\\simra\\OneDrive\\Desktop\\VeriAI\\hallucination_verification.db",
  "critic_enabled": true,
  "llm_configured": false
}
```

---

## 2. Text Generation

### `POST /api/generate`
Generates an AI answer to a given question using configured LLM providers or rule-based fallback generators.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "question": "When was SpaceX founded and when was its first launch?",
  "model": "hybrid-verifier-v1",
  "temperature": 0.2
}
```
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
{
  "question": "When was SpaceX founded and when was its first launch?",
  "answer": "SpaceX was founded in 2002 by Elon Musk. Its first orbital rocket, Falcon 1, launched in 2008.",
  "model": "hybrid-verifier-v1",
  "created_at": "2026-10-30T08:15:00.000000+00:00"
}
```

---

## 3. Claim Extraction

### `POST /api/claims`
Decomposes an input text or answer into atomic, typed propositions.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "answer": "SpaceX was founded in 1999 by Elon Musk. Falcon 1 launched in 2008.",
  "question": "When was SpaceX founded?"
}
```
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
{
  "claims": [
    {
      "claim_id": "C001",
      "claim": "SpaceX was founded in 1999.",
      "claim_type": "temporal",
      "importance": 0.9,
      "requires_verification": true,
      "original_sentence": "SpaceX was founded in 1999 by Elon Musk."
    },
    {
      "claim_id": "C002",
      "claim": "SpaceX was founded by Elon Musk.",
      "claim_type": "biographical",
      "importance": 0.8,
      "requires_verification": true,
      "original_sentence": "SpaceX was founded in 1999 by Elon Musk."
    }
  ]
}
```

---

## 4. Single Claim Verification

### `POST /api/verify`
Retrieves evidence and verifies an isolated single claim.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "claim": {
    "claim_id": "C001",
    "claim": "SpaceX was founded in 1999.",
    "claim_type": "temporal",
    "importance": 0.9,
    "requires_verification": true,
    "original_sentence": "SpaceX was founded in 1999 by Elon Musk."
  },
  "question": "When was SpaceX founded?"
}
```
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
{
  "claim_id": "C001",
  "verdict": "CONTRADICTED",
  "confidence": 0.95,
  "reason": "Official sources verify that SpaceX was founded in March 2002, contradicting 1999.",
  "evidence_ids": ["EV001", "EV002"],
  "source_quality_avg": 88.0,
  "critic_status": "PASSED",
  "critic_notes": null,
  "discrepancy_details": {
    "type": "temporal_conflict",
    "claimed": "1999",
    "authoritative": "2002"
  }
}
```

---

## 5. Full Verification Pipeline (`/api/analyze`)

### `POST /api/analyze`
Executes the end-to-end multi-agent pipeline: Question + Answer $\rightarrow$ Claim Extraction $\rightarrow$ Evidence Retrieval $\rightarrow$ Source Quality Evaluation $\rightarrow$ Grounded NLI Verification $\rightarrow$ Adversarial Critic Pass $\rightarrow$ Hallucination Scoring Engine $\rightarrow$ SQLite Persistence.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "question": "When was SpaceX founded and when did it launch its first rocket?",
  "answer": "Elon Musk founded SpaceX in 1999 and the aerospace company successfully launched its first orbital rocket in 2008.",
  "model_name": "custom-input",
  "enable_critic": true
}
```
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
{
  "report_id": "REP-8A2F1C90",
  "question": "When was SpaceX founded and when did it launch its first rocket?",
  "answer": "Elon Musk founded SpaceX in 1999 and the aerospace company successfully launched its first orbital rocket in 2008.",
  "model_name": "custom-input",
  "created_at": "2026-10-30T08:20:00.000000+00:00",
  "overall_reliability": 46.5,
  "hallucination_risk": 53.5,
  "score_calculation_breakdown": {
    "summary_counts": {
      "total": 3,
      "supported": 2,
      "partially_supported": 0,
      "contradicted": 1,
      "unverified": 0,
      "not_factual": 0
    },
    "weighted_verdict_score": 52.0,
    "confidence_factor": 0.92,
    "source_quality_factor": 0.85
  },
  "summary_counts": {
    "total": 3,
    "supported": 2,
    "partially_supported": 0,
    "contradicted": 1,
    "unverified": 0,
    "not_factual": 0
  },
  "claims": [
    {
      "claim_id": "C001",
      "claim": "Elon Musk founded SpaceX.",
      "claim_type": "biographical",
      "importance": 0.8,
      "requires_verification": true,
      "original_sentence": "Elon Musk founded SpaceX in 1999..."
    },
    {
      "claim_id": "C002",
      "claim": "SpaceX was founded in 1999.",
      "claim_type": "temporal",
      "importance": 0.9,
      "requires_verification": true,
      "original_sentence": "Elon Musk founded SpaceX in 1999..."
    },
    {
      "claim_id": "C003",
      "claim": "SpaceX launched its first orbital rocket in 2008.",
      "claim_type": "historical",
      "importance": 0.85,
      "requires_verification": true,
      "original_sentence": "...successfully launched its first orbital rocket in 2008."
    }
  ],
  "evidence": [
    {
      "evidence_id": "EV001",
      "claim_id": "C002",
      "source_title": "SpaceX - Wikipedia",
      "source_url": "https://en.wikipedia.org/wiki/SpaceX",
      "source_domain": "en.wikipedia.org",
      "source_type": "reference",
      "snippet": "Space Exploration Technologies Corp. is an American aerospace manufacturer founded in March 2002 by Elon Musk.",
      "relevance": 0.95,
      "source_quality_score": 75.0,
      "quality_explanation": "Authoritative encyclopedia reference with citation history.",
      "retrieved_at": "2026-10-30T08:20:01.000000+00:00"
    }
  ],
  "results": [
    {
      "claim_id": "C001",
      "verdict": "SUPPORTED",
      "confidence": 0.95,
      "reason": "Directly confirmed by authoritative biographical records.",
      "evidence_ids": ["EV001"],
      "source_quality_avg": 75.0,
      "critic_status": "PASSED",
      "critic_notes": null,
      "discrepancy_details": null
    },
    {
      "claim_id": "C002",
      "verdict": "CONTRADICTED",
      "confidence": 0.98,
      "reason": "SpaceX was established in 2002, contradicting the claimed founding year of 1999.",
      "evidence_ids": ["EV001"],
      "source_quality_avg": 75.0,
      "critic_status": "PASSED",
      "critic_notes": "Temporal mismatch verified.",
      "discrepancy_details": { "claimed": "1999", "evidence": "2002" }
    },
    {
      "claim_id": "C003",
      "verdict": "SUPPORTED",
      "confidence": 0.92,
      "reason": "Falcon 1 reached orbit on September 28, 2008.",
      "evidence_ids": ["EV001"],
      "source_quality_avg": 75.0,
      "critic_status": "PASSED",
      "critic_notes": null,
      "discrepancy_details": null
    }
  ],
  "explanation": "Significant temporal contradiction detected on critical claim C002 regarding the founding year (1999 vs 2002)."
}
```

---

## 6. Audit Reports & History

### `GET /api/reports?limit=20`
Lists recent verification audits.

- **Query Parameters**: `limit` (default: `20`, min: `1`, max: `100`)
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
[
  {
    "report_id": "REP-8A2F1C90",
    "question": "When was SpaceX founded and when did it launch its first rocket?",
    "answer": "Elon Musk founded SpaceX in 1999...",
    "model_name": "custom-input",
    "created_at": "2026-10-30T08:20:00.000000+00:00",
    "overall_reliability": 46.5,
    "hallucination_risk": 53.5,
    "summary_counts": {
      "total": 3,
      "supported": 2,
      "contradicted": 1,
      "partially_supported": 0,
      "unverified": 0,
      "not_factual": 0
    }
  }
]
```

### `GET /api/reports/{report_id}`
Retrieves full details for a single verification audit by ID.
- **Response Status**: `200 OK` (returns full `VerificationReport` object) or `404 Not Found`.

### `GET /api/reports/{report_id}/text`
Returns formatted plain-text trace for export/copying.
- **Response Status**: `200 OK`
- **Response Body Example**:
```json
{
  "report_id": "REP-8A2F1C90",
  "text_summary": "============================================================\nVERIFICATION AUDIT REPORT\n..."
}
```

---

## 7. Streaming & Text Spans Analysis

1. **Streaming**: The current FastAPI endpoints are standard request/response endpoints (`await pipeline.run(...)`) and do **not** stream SSE or WebSocket chunks. To present a delightful user experience, the frontend will animate through the pipeline stages (Extracting claims $\rightarrow$ Retrieving evidence $\rightarrow$ Evaluating sources $\rightarrow$ Verifying $\rightarrow$ Critic review $\rightarrow$ Scoring) during the active request lifecycle.
2. **Text Spans**: Claims include `original_sentence: Optional[str]`, but no exact character offsets `[start, end]`. The frontend will use robust fuzzy/substring matching on `original_sentence` to dynamically color-code claims inside the original text answer, with a smooth fallback if not found.

