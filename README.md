# AI Hallucination Detection & Verification System

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![Pydantic v2](https://img.shields.io/badge/Pydantic-2.0+-red.svg)](https://docs.pydantic.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade, claim-level **AI Hallucination Detection and Verification System**. Rather than relying on superficial keyword matching or vulnerable self-consistency loops, this system breaks AI answers down into atomic, typed propositions, searches independent authoritative knowledge bases, calculates explainable source-quality scores, detects fine-grained contradictions (temporal, numerical, entity), subjects verdicts to an adversarial critic pass, and computes deterministic reliability metrics.

---

## Architecture Overview

```
USER INPUT (Question or Pasted Answer)
   │
   ▼
AGENT 1: ANSWER GENERATOR (LLM / Attribution)
   │
   ▼
AGENT 2: CLAIM EXTRACTION AGENT (Atomic Decomposition & Typing)
   │
   ▼
CLAIM NORMALIZATION & SEARCH PLANNER (Targeted Queries & Entity Anchors)
   │
   ▼
AGENT 3: EVIDENCE RETRIEVAL AGENT (Wikipedia API + DuckDuckGo + Web Scraping)
   │
   ▼
SOURCE QUALITY EVALUATOR (0–100 Explainable Rubric: Authority / Recency / Relevance)
   │
   ▼
AGENT 4: CLAIM VERIFICATION AGENT (Strict Grounded NLI: SUPPORTED / PARTIALLY / CONTRADICTED / UNVERIFIED)
   │
   ▼
CROSS-CHECK & CONTRADICTION DETECTOR (Temporal, Numerical & Inter-Source Disagreements)
   │
   ▼
AGENT 5: ADVERSARIAL CRITIC (Audits Verdicts, Catches Confirmation Bias & Weak Provenance)
   │
   ▼
AGENT 6: HALLUCINATION SCORING ENGINE (Overall Reliability 0-100 & Hallucination Risk %)
   │
   ▼
DATABASE (SQLite Audit Repository) & INTERACTIVE DASHBOARD UI
```

---

## Key Features

1. **Atomic Claim Extraction & Classification**:
   - Decomposes compound paragraphs into testable factual claims.
   - Categorizes each claim into 12+ types: `historical`, `scientific`, `numerical`, `geographic`, `financial`, `political`, `technical`, `biographical`, `medical`, `temporal`, `opinion`, `definition`, `mathematical`.
   - Isolates opinions and value judgments so they are not falsely classified as hallucinations (`NOT_FACTUAL`).

2. **Multi-Source Evidence Gathering**:
   - Primary encyclopedia references via Wikipedia REST API.
   - Real-time web retrieval via DuckDuckGo text search.
   - Clean HTML scraping and semantic paragraph extraction using `PageScraper`.
   - Zero snippet blind-trust: extracts full context chunks around matching claim targets.

3. **Explainable Source Quality Scoring (0–100)**:
   - Evaluates domain provenance (Government/Official `+92`, Academic/Peer-reviewed `+88`, Global Journalism `+80`, Reference `+75`, UGC/Forums `25`).
   - Penalizes low-relevance snippets and unvetted publishing platforms.

4. **Zero-Trust Verification & "Do Not Hallucinate the Verifier"**:
   - Claims are strictly checked against retrieved text snippets.
   - An absence of evidence strictly yields `UNVERIFIED` (never guessed as false or true).
   - Verifier only cites actual retrieved `evidence_id` tokens.

5. **Cross-Source Contradiction Detection**:
   - Detects date and numerical discrepancies (e.g. claim says `1999`, official source says `2002`).
   - Detects inter-source discordance without falling into the majority voting fallacy.

6. **Adversarial Critic Loop**:
   - A dedicated Critic agent challenges the verifier's findings before scoring.
   - Overturns lenient verdicts on claims with divergent dates or numbers.
   - Revokes `SUPPORTED` status if only low-credibility sources were cited.

7. **Deterministic Scoring Formula**:
   - **Overall Reliability (0–100)**: Weighted harmonic aggregation of claim importance, verification confidence, and source quality score.
   - **Hallucination Risk (%)**: Quantifies uncertainty and confirmed contradictions with severity penalties.

8. **Interactive UI & REST API**:
   - Fast, high-contrast dashboard with live pipeline progress stepper.
   - Color-coded verdict badges: `SUPPORTED`, `PARTIALLY_SUPPORTED`, `CONTRADICTED`, `UNVERIFIED`, `NOT_FACTUAL`.
   - Clickable source citations with quality ratings and snippet previews.
   - Plain-text audit export and JSON download.

---

## Project Structure

```
hallucination_detector/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints.py         # REST routers: /generate, /analyze, /claims, /verify, /reports
│   │   │   └── health.py            # Health check endpoint
│   │   ├── agents/
│   │   │   ├── generator.py         # Agent 1: LLM Answer Generator
│   │   │   ├── extractor.py         # Agent 2: Atomic Claim Extractor
│   │   │   ├── normalizer.py        # Claim Normalizer & Query Planner
│   │   │   ├── retriever.py         # Agent 3: Evidence Retrieval Agent
│   │   │   ├── evaluator.py         # Source Quality Evaluator (0-100)
│   │   │   ├── verifier.py          # Agent 4: Grounded Claim Verifier
│   │   │   ├── contradiction.py     # Contradiction & Discrepancy Detector
│   │   │   ├── critic.py            # Agent 5: Adversarial Critic Auditor
│   │   │   └── scorer.py            # Agent 6: Hallucination Scoring Engine
│   │   ├── retrieval/
│   │   │   ├── base.py              # Base retriever interface
│   │   │   ├── wikipedia.py         # Wikipedia REST API client
│   │   │   ├── duckduckgo.py        # DuckDuckGo search integration
│   │   │   └── scraper.py           # HTML cleaner & snippet extractor
│   │   ├── database/
│   │   │   ├── session.py           # SQLite connection manager
│   │   │   └── repository.py        # Report and claim persistence
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic v2 data models
│   │   ├── services/
│   │   │   ├── pipeline.py          # End-to-end async pipeline orchestrator
│   │   │   └── report_generator.py  # Text and audit report formatting
│   │   ├── config.py                # Environment configuration
│   │   └── main.py                  # FastAPI application entrypoint
│   ├── evaluation/
│   │   ├── adversarial_cases.json   # 10 test cases from Section 22
│   │   └── benchmark.py             # Evaluation runner (P/R/F1/ECE)
│   └── tests/
│       ├── test_agents.py           # Agent unit tests
│       ├── test_retrieval.py        # Scraper and retrieval tests
│       ├── test_verifier.py         # Grounding & contradiction tests
│       ├── test_scoring.py          # Mathematical scoring tests
│       └── test_api.py              # FastAPI integration tests
├── frontend/
│   ├── index.html                   # Interactive Single Page UI
│   ├── styles.css                   # High-contrast CSS stylesheet
│   └── app.js                       # Progress tracking & verdict rendering
├── .env.example                     # Sample environment variables
├── requirements.txt                 # Dependencies
├── README.md                        # Project documentation
└── run.py                           # CLI and server launcher
```

---

## Quickstart Guide

### 1. Installation
Clone the repository and install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Configuration (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: The system is equipped with hybrid offline heuristics and public API integrations, allowing it to run out of the box even without external paid API keys. You can add `GEMINI_API_KEY` or `OPENAI_API_KEY` to connect live frontier models).*

### 3. Launch Server & UI
Run the launcher:
```bash
python run.py
```
Open your browser at **http://127.0.0.1:8000** to access the interactive dashboard.

### 4. Run Test Suite
```bash
python run.py --test
```

### 5. Run Adversarial Benchmark
```bash
python run.py --benchmark
```

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and configured model info |
| `POST` | `/api/generate` | Generates initial answer for a question |
| `POST` | `/api/claims` | Extracts atomic claims from input text |
| `POST` | `/api/verify` | Verifies a single claim against evidence |
| `POST` | `/api/analyze` | Executes the complete verification pipeline |
| `GET` | `/api/reports` | Lists recent verification audits |
| `GET` | `/api/reports/{id}` | Fetches a structured verification report |
| `GET` | `/api/reports/{id}/text` | Returns formatted plain-text audit trace |

---

## Adversarial Benchmark Suite (Section 22)

The system includes an automated evaluation harness tested against 10 difficult scenarios:
1. **Completely False Fact**: High-confidence falsehood ("Sydney is the capital of Australia").
2. **Incorrect Date**: Real entity with erroneous year ("SpaceX founded in 1999").
3. **Mixed True & Fabricated**: Neil Armstrong moon landing mixed with fake UN appointment.
4. **Fake Citation**: Invented Nature paper and fictitious researcher.
5. **Conflicting Sources**: Nuanced attribution of the telephone invention (Bell vs Gray/Meucci).
6. **Outdated Fact**: Obsolete historical statistics (past UK population).
7. **Obscure Fact**: Isaac Newton's dog Diamond.
8. **Subtly Wrong Calculation**: Vacuum light speed in km/h unit conversion error.
9. **Misleading Context**: Thomas Edison light bulb invention without historical qualification.
10. **Consensus Fallacy**: Debunking the popular "10% brain capacity" myth.

Run `python run.py --benchmark` to compute Precision, Recall, F1, Expected Calibration Error (ECE), and verification accuracy.
