from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from backend.app.models.schemas import (
    GenerateRequest,
    GenerateResponse,
    AnalyzeRequest,
    ExtractClaimsRequest,
    ExtractClaimsResponse,
    VerifyClaimRequest,
    VerificationReport,
    VerificationResult,
)
from backend.app.services.pipeline import PipelineOrchestrator
from backend.app.services.report_generator import ReportGeneratorService
from backend.app.agents.extractor import ClaimExtractorAgent
from backend.app.agents.normalizer import ClaimNormalizerAgent
from backend.app.agents.retriever import EvidenceRetrievalAgent
from backend.app.agents.verifier import ClaimVerifierAgent
from backend.app.database.repository import ReportRepository

router = APIRouter(tags=["Verification & Analysis"])

pipeline = PipelineOrchestrator()
extractor_agent = ClaimExtractorAgent()
normalizer_agent = ClaimNormalizerAgent()
retriever_agent = EvidenceRetrievalAgent()
verifier_agent = ClaimVerifierAgent()

@router.post("/generate", response_model=GenerateResponse)
async def generate_answer(req: GenerateRequest):
    """Generates an initial answer to the user's question."""
    try:
        response = await pipeline.generator.generate(
            question=req.question,
            model_name=req.model,
            temperature=req.temperature or 0.2
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/analyze", response_model=VerificationReport)
async def analyze_and_verify(req: AnalyzeRequest):
    """Runs the full verification pipeline: Answer -> Claims -> Evidence -> Verification -> Scoring -> Report."""
    try:
        report = await pipeline.run(
            question=req.question,
            answer=req.answer,
            model_name=req.model_name,
            enable_critic=req.enable_critic if req.enable_critic is not None else True
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/claims", response_model=ExtractClaimsResponse)
async def extract_claims(req: ExtractClaimsRequest):
    """Deconstructs text into atomic factual claims with type and importance metadata."""
    try:
        claims = await extractor_agent.extract_claims(req.answer, question=req.question)
        return ExtractClaimsResponse(claims=claims)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

@router.post("/verify", response_model=VerificationResult)
async def verify_single_claim(req: VerifyClaimRequest):
    """Retrieves evidence and verifies a single claim."""
    try:
        claim = req.claim
        normalized = normalizer_agent.normalize(claim)
        evidence = await retriever_agent.retrieve_for_claim(claim, normalized)
        result = await verifier_agent.verify(claim, evidence)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.get("/reports", response_model=List[Dict[str, Any]])
async def list_reports(limit: int = Query(default=20, ge=1, le=100)):
    """Retrieves recent verification reports."""
    try:
        return ReportRepository.list_reports(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

@router.get("/reports/{report_id}", response_model=VerificationReport)
async def get_report_by_id(report_id: str):
    """Retrieves a specific verification report by ID."""
    report = ReportRepository.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/reports/{report_id}/text")
async def get_report_text_by_id(report_id: str):
    """Returns the plain-text audit trace format of the verification report."""
    report = ReportRepository.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    text_summary = ReportGeneratorService.generate_text_summary(report)
    return {"report_id": report_id, "text_summary": text_summary}
